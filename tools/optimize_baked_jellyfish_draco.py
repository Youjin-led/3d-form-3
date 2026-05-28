from pathlib import Path

import bpy


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SOURCE = ASSETS / "baked_geonodes_jellyfish.glb"
TARGET = ASSETS / "baked_geonodes_jellyfish.draco.glb"


def main():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()

    bpy.ops.import_scene.gltf(filepath=str(SOURCE))

    bpy.ops.export_scene.gltf(
        filepath=str(TARGET),
        export_format="GLB",
        export_animations=True,
        export_lights=False,
        export_cameras=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=16,
        export_draco_normal_quantization=14,
        export_draco_texcoord_quantization=14,
        export_draco_color_quantization=14,
        export_draco_generic_quantization=14,
    )
    print(f"SAVED {TARGET}")
    print(f"SOURCE_BYTES {SOURCE.stat().st_size}")
    print(f"TARGET_BYTES {TARGET.stat().st_size}")


if __name__ == "__main__":
    main()
