import re
import os
import glob

def refactor_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # White and slate backgrounds
    text = re.sub(r'\bbg-white\b(?!/5)', 'bg-slate-900/40 backdrop-blur-md', text)
    text = re.sub(r'\bbg-slate-50\b', 'bg-slate-800/40', text)
    text = re.sub(r'\bbg-slate-100\b', 'bg-slate-800/60', text)
    text = re.sub(r'\bbg-slate-200\b', 'bg-slate-800/80', text)
    
    # Generic fractional replacements for colored backgrounds 
    # (e.g. bg-emerald-50/50 -> bg-emerald-900/20)
    def replace_color_bg(match):
        color = match.group(1)
        return f'bg-{color}-900/20'
    text = re.sub(r'\bbg-([a-z]+)-50(?:/\d+)?\b', replace_color_bg, text)

    # Hover backgrounds
    text = re.sub(r'\bhover:bg-slate-50(?:/\d+)?\b', 'hover:bg-white/5', text)
    text = re.sub(r'\bhover:bg-slate-100(?:/\d+)?\b', 'hover:bg-white/10', text)

    # Borders
    text = re.sub(r'\bborder-slate-100\b', 'border-white/10', text)
    text = re.sub(r'\bborder-slate-200(?:/\d+)?\b', 'border-white/15', text)
    text = re.sub(r'\bborder-slate-300(?:/\d+)?\b', 'border-white/20', text)

    # Text Colors
    text = re.sub(r'\btext-slate-[89]00\b', 'text-white', text)
    text = re.sub(r'\btext-slate-700\b', 'text-slate-200', text)
    text = re.sub(r'\btext-slate-[56]00\b', 'text-slate-400', text)
    text = re.sub(r'\btext-slate-400\b', 'text-slate-500', text)

    # Input specific overrides (focus rings, etc)
    text = re.sub(r'\bfocus:bg-white\b', 'focus:bg-slate-900/60', text)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)

files = glob.glob('src/components/*.tsx')
for file_path in files:
    refactor_file(file_path)
    print(f'Refactored {file_path}')

