import os
from rag_engine.mindmap_creator import MindMapGenerator

def generate_mindmap_from_text(text: str, file_name: str):
    try:
        mindmap_dir = f"mindmaps/{file_name}"
        os.makedirs(mindmap_dir, exist_ok=True)

        md_path = f"{mindmap_dir}/mindmap.md"
        html_path = f"{mindmap_dir}/mindmap.html"

        generator = MindMapGenerator()
        generator.create_mindmap(text=text, output_md=md_path)
        generator.render_html(md_file=md_path, output_html=html_path)

        print(f"[INFO] Mindmap generated for {file_name}")
    except Exception as e:
        print(f"[WARN] Failed to generate mindmap for {file_name}: {e}")
