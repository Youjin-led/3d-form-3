const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const input = process.argv[2]
  ? path.resolve(root, process.argv[2])
  : path.join(root, 'assets', 'baked_geonodes_jellyfish.draco.glb');
const output = process.argv[3]
  ? path.resolve(root, process.argv[3])
  : path.join(root, 'assets', 'baked_geonodes_jellyfish.runtime.glb');

function align4(value) {
  return (value + 3) & ~3;
}

function readGlb(file) {
  const data = fs.readFileSync(file);
  if (data.toString('utf8', 0, 4) !== 'glTF') {
    throw new Error(`${file} is not a GLB file`);
  }
  const jsonLength = data.readUInt32LE(12);
  const jsonType = data.toString('utf8', 16, 20);
  if (jsonType !== 'JSON') {
    throw new Error('First GLB chunk is not JSON');
  }
  const json = JSON.parse(data.toString('utf8', 20, 20 + jsonLength));
  const binHeader = 20 + jsonLength;
  const binLength = data.readUInt32LE(binHeader);
  const binType = data.toString('utf8', binHeader + 4, binHeader + 8);
  if (binType !== 'BIN\0') {
    throw new Error('Second GLB chunk is not BIN');
  }
  const bin = data.subarray(binHeader + 8, binHeader + 8 + binLength);
  return { json, bin };
}

function collectUsedAccessors(json) {
  const used = new Set();
  let strippedTargets = 0;

  for (const mesh of json.meshes || []) {
    for (const primitive of mesh.primitives || []) {
      for (const accessor of Object.values(primitive.attributes || {})) {
        used.add(accessor);
      }
      if (primitive.indices !== undefined) {
        used.add(primitive.indices);
      }
      for (const target of primitive.targets || []) {
        if (target.NORMAL !== undefined) {
          delete target.NORMAL;
          strippedTargets += 1;
        }
        for (const accessor of Object.values(target)) {
          used.add(accessor);
        }
      }
    }
  }

  for (const animation of json.animations || []) {
    for (const sampler of animation.samplers || []) {
      if (sampler.input !== undefined) used.add(sampler.input);
      if (sampler.output !== undefined) used.add(sampler.output);
    }
  }

  for (const skin of json.skins || []) {
    if (skin.inverseBindMatrices !== undefined) {
      used.add(skin.inverseBindMatrices);
    }
  }

  return { used, strippedTargets };
}

function remapAccessors(json, usedAccessors) {
  const accessorMap = new Map();
  const nextAccessors = [];
  json.accessors.forEach((accessor, index) => {
    if (!usedAccessors.has(index)) return;
    accessorMap.set(index, nextAccessors.length);
    nextAccessors.push(accessor);
  });

  for (const mesh of json.meshes || []) {
    for (const primitive of mesh.primitives || []) {
      for (const key of Object.keys(primitive.attributes || {})) {
        primitive.attributes[key] = accessorMap.get(primitive.attributes[key]);
      }
      if (primitive.indices !== undefined) {
        primitive.indices = accessorMap.get(primitive.indices);
      }
      for (const target of primitive.targets || []) {
        for (const key of Object.keys(target)) {
          target[key] = accessorMap.get(target[key]);
        }
      }
    }
  }

  for (const animation of json.animations || []) {
    for (const sampler of animation.samplers || []) {
      if (sampler.input !== undefined) sampler.input = accessorMap.get(sampler.input);
      if (sampler.output !== undefined) sampler.output = accessorMap.get(sampler.output);
    }
  }

  for (const skin of json.skins || []) {
    if (skin.inverseBindMatrices !== undefined) {
      skin.inverseBindMatrices = accessorMap.get(skin.inverseBindMatrices);
    }
  }

  json.accessors = nextAccessors;
}

function collectUsedBufferViews(json) {
  const used = new Set();
  for (const accessor of json.accessors || []) {
    if (accessor.bufferView !== undefined) {
      used.add(accessor.bufferView);
    }
    if (accessor.sparse) {
      if (accessor.sparse.indices?.bufferView !== undefined) {
        used.add(accessor.sparse.indices.bufferView);
      }
      if (accessor.sparse.values?.bufferView !== undefined) {
        used.add(accessor.sparse.values.bufferView);
      }
    }
  }
  for (const mesh of json.meshes || []) {
    for (const primitive of mesh.primitives || []) {
      const dracoView = primitive.extensions?.KHR_draco_mesh_compression?.bufferView;
      if (dracoView !== undefined) {
        used.add(dracoView);
      }
    }
  }
  return used;
}

function remapBufferViews(json, bin, usedBufferViews) {
  const viewMap = new Map();
  const nextViews = [];
  const chunks = [];
  let offset = 0;

  json.bufferViews.forEach((view, index) => {
    if (!usedBufferViews.has(index)) return;
    const byteOffset = view.byteOffset || 0;
    const source = bin.subarray(byteOffset, byteOffset + view.byteLength);
    const aligned = align4(offset);
    if (aligned > offset) {
      chunks.push(Buffer.alloc(aligned - offset));
      offset = aligned;
    }
    const nextView = { ...view, byteOffset: offset };
    viewMap.set(index, nextViews.length);
    nextViews.push(nextView);
    chunks.push(Buffer.from(source));
    offset += source.length;
  });

  for (const accessor of json.accessors || []) {
    if (accessor.bufferView !== undefined) {
      accessor.bufferView = viewMap.get(accessor.bufferView);
    }
    if (accessor.sparse) {
      if (accessor.sparse.indices?.bufferView !== undefined) {
        accessor.sparse.indices.bufferView = viewMap.get(accessor.sparse.indices.bufferView);
      }
      if (accessor.sparse.values?.bufferView !== undefined) {
        accessor.sparse.values.bufferView = viewMap.get(accessor.sparse.values.bufferView);
      }
    }
  }

  for (const mesh of json.meshes || []) {
    for (const primitive of mesh.primitives || []) {
      const draco = primitive.extensions?.KHR_draco_mesh_compression;
      if (draco?.bufferView !== undefined) {
        draco.bufferView = viewMap.get(draco.bufferView);
      }
    }
  }

  json.bufferViews = nextViews;
  const nextBin = Buffer.concat(chunks);
  json.buffers = [{ byteLength: nextBin.length }];
  return nextBin;
}

function writeGlb(json, bin, file) {
  let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  const jsonPadding = align4(jsonBuffer.length) - jsonBuffer.length;
  if (jsonPadding) {
    jsonBuffer = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPadding, 0x20)]);
  }

  const binPadding = align4(bin.length) - bin.length;
  const paddedBin = binPadding ? Buffer.concat([bin, Buffer.alloc(binPadding)]) : bin;
  const totalLength = 12 + 8 + jsonBuffer.length + 8 + paddedBin.length;

  const header = Buffer.alloc(12);
  header.write('glTF', 0, 4, 'utf8');
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonHeader.write('JSON', 4, 4, 'utf8');

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(paddedBin.length, 0);
  binHeader.write('BIN\0', 4, 4, 'utf8');

  fs.writeFileSync(file, Buffer.concat([header, jsonHeader, jsonBuffer, binHeader, paddedBin]));
}

const { json, bin } = readGlb(input);
const beforeAccessors = json.accessors?.length || 0;
const beforeViews = json.bufferViews?.length || 0;
const { used, strippedTargets } = collectUsedAccessors(json);
remapAccessors(json, used);
const usedViews = collectUsedBufferViews(json);
const nextBin = remapBufferViews(json, bin, usedViews);
writeGlb(json, nextBin, output);

const result = {
  input: path.relative(root, input),
  output: path.relative(root, output),
  strippedTargets,
  accessors: `${beforeAccessors} -> ${json.accessors.length}`,
  bufferViews: `${beforeViews} -> ${json.bufferViews.length}`,
  bytes: `${fs.statSync(input).size} -> ${fs.statSync(output).size}`,
};
console.log(JSON.stringify(result, null, 2));
