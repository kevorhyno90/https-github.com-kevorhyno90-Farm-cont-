import re

def apply_financials_dark(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # General background and border replacements
    text = re.sub(r'\bbg-white\b(?!/5)', 'bg-white/5 backdrop-blur-xl', text)
    text = re.sub(r'\bborder-slate-100\b', 'border-white/10', text)
    text = re.sub(r'\bborder-slate-150\b', 'border-white/10', text)
    text = re.sub(r'\bborder-slate-200\b', 'border-white/10', text)
    text = re.sub(r'\bborder-slate-300\b', 'border-white/20', text)
    text = re.sub(r'\bbg-slate-50/50\b', 'bg-black/20', text)
    text = re.sub(r'\bbg-slate-50\b', 'bg-black/30', text)
    text = re.sub(r'\bbg-slate-100\b', 'bg-black/40', text)
    
    # Hover states
    text = re.sub(r'\bhover:bg-slate-50\b', 'hover:bg-white/10', text)
    text = re.sub(r'\bhover:bg-slate-100\b', 'hover:bg-white/10', text)
    
    # Text colors
    text = re.sub(r'\btext-slate-[89]05?\b', 'text-white', text)
    text = re.sub(r'\btext-slate-[89]00\b', 'text-white', text)
    text = re.sub(r'\btext-slate-[67]00\b', 'text-slate-200', text)
    text = re.sub(r'\btext-slate-500\b', 'text-slate-400', text)
    
    # Shadows
    text = re.sub(r'\bshadow-sm\b', 'shadow-[0_8px_30px_rgb(0,0,0,0.12)]', text)
    text = re.sub(r'\bshadow-md\b', 'shadow-[0_8px_30px_rgb(0,0,0,0.2)]', text)

    # Recharts Tooltip styling
    text = text.replace('backgroundColor: \'white\'', 'backgroundColor: \'rgba(15, 23, 42, 0.9)\'')
    text = text.replace('backgroundColor: \'#ffffff\'', 'backgroundColor: \'rgba(15, 23, 42, 0.9)\'')
    
    # Fix all inputs explicitly, searching for combinations of border-slate and bg-white
    text = text.replace('border border-white/10 rounded-lg', 'bg-black/40 text-white placeholder-slate-400 border border-white/10 rounded-lg')
    text = text.replace('border border-white/10 rounded-xl', 'bg-black/40 text-white placeholder-slate-400 border border-white/10 rounded-xl')
    
    # Some inputs in Financials might not have rounded-lg.
    # Let's also do a general replace for inputs that might have gotten the backdrop-blur treatment.
    text = text.replace('bg-white/5 backdrop-blur-xl border border-white/10 px-3', 'bg-black/40 text-white placeholder-slate-400 border border-white/10 px-3')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)

apply_financials_dark('src/components/Financials.tsx')
print('Financials dark mode applied!')
