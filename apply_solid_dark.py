import re
import glob

def refactor_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Remove all backdrop-blur classes
    text = re.sub(r'\bbackdrop-blur-[a-z]+\b', '', text)
    
    # 2. Make slate backgrounds solid (removing opacities)
    text = re.sub(r'\bbg-slate-950/\d+\b', 'bg-slate-950', text)
    text = re.sub(r'\bbg-slate-900/\d+\b', 'bg-slate-900', text)
    text = re.sub(r'\bbg-slate-800/\d+\b', 'bg-slate-800', text)
    
    # 3. Enhance Text Contrast
    text = re.sub(r'\btext-slate-500\b', 'text-slate-300 font-medium', text)
    text = re.sub(r'\btext-slate-400\b', 'text-slate-200 font-medium', text)
    text = re.sub(r'\btext-slate-300\b', 'text-white font-medium', text)
    text = re.sub(r'\btext-slate-200\b', 'text-white font-semibold', text)
    text = re.sub(r'\btext-slate-100\b', 'text-white font-bold', text)
    
    # Clean up double spaces created by blur removal ONLY on the same line
    text = re.sub(r'[ ]{2,}', ' ', text)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)

files = glob.glob('src/components/*.tsx')
for file_path in files:
    refactor_file(file_path)
    print(f'Applied solid dark to {file_path}')

