import re
import glob

def refactor_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # Surface Colors
    text = re.sub(r'\bbg-slate-950\b', 'bg-slate-50', text)
    text = re.sub(r'\bbg-slate-900\b', 'bg-white shadow-sm', text)
    text = re.sub(r'\bbg-slate-800\b', 'bg-slate-50 border border-slate-200', text)
    text = re.sub(r'\bhover:bg-slate-800\b', 'hover:bg-slate-50', text)
    text = re.sub(r'\bhover:bg-slate-700\b', 'hover:bg-slate-100', text)
    
    # Border Colors
    text = re.sub(r'\bborder-white/15\b', 'border-slate-200', text)
    text = re.sub(r'\bhover:border-white/20\b', 'hover:border-slate-300', text)
    text = re.sub(r'\bborder-slate-[789]00\b', 'border-slate-200', text)

    # Clean up weird font weights from previous script
    text = re.sub(r'\bfont-medium\s+font-medium\b', 'font-medium', text)
    text = re.sub(r'\bfont-semibold\s+font-medium\b', 'font-semibold', text)
    text = re.sub(r'\bfont-bold\s+font-semibold\b', 'font-bold', text)
    
    # Text Colors (Light to Dark)
    # Be careful not to replace text-white inside buttons (e.g. bg-emerald-600 text-white)
    # A simple heuristic: if it has bg-emerald or bg-rose, it should stay white.
    # But since it's hard to parse context with regex, we can do a global replace 
    # of text-white -> text-slate-900, BUT then restore text-white for buttons.
    # Actually, if we just replace text-white with text-slate-900 globally, we can fix buttons later,
    # OR we can just replace text-slate-400 -> text-slate-500, etc.
    # Wait, the previous script changed ALL text to text-white. 
    text = re.sub(r'\btext-white\b', 'text-slate-900', text)
    text = re.sub(r'\btext-slate-200\b', 'text-slate-700', text)
    text = re.sub(r'\btext-slate-300\b', 'text-slate-600', text)
    
    # Restore text-white for solid primary buttons
    text = re.sub(r'(bg-emerald-[567]00[^>]*?)text-slate-900', r'\1text-white', text)
    text = re.sub(r'(bg-rose-[567]00[^>]*?)text-slate-900', r'\1text-white', text)
    text = re.sub(r'(bg-blue-[567]00[^>]*?)text-slate-900', r'\1text-white', text)

    # Emerald Accents for active states
    text = re.sub(r'\bbg-emerald-900/20\b', 'bg-emerald-50', text)
    
    # Extra cleanup
    text = re.sub(r'[ ]{2,}', ' ', text)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)

files = glob.glob('src/components/*.tsx')
for file_path in files:
    refactor_file(file_path)
    print(f'Applied modern light to {file_path}')

