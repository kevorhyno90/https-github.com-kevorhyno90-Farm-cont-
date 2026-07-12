import re

def modernize_light(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # Elevate main containers
    text = text.replace('bg-white p-6 rounded-2xl border border-slate-100 shadow-sm', 
                        'bg-white p-6 rounded-3xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500')
    text = text.replace('bg-white p-6 rounded-3xl border border-slate-100 shadow-sm', 
                        'bg-white p-6 rounded-3xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500')
    
    # Soften standard borders
    text = re.sub(r'\bborder-slate-100\b', 'border-slate-200/50', text)
    
    # Add transition to buttons
    text = re.sub(r'(hover:bg-[a-z]+-[0-9]+(?:\/\d+)?)', r'\1 active:scale-95 transition-all duration-300 ease-in-out', text)
    
    # Tab containers
    text = text.replace('bg-slate-100 rounded-2xl', 'bg-slate-100/50 rounded-2xl backdrop-blur-sm shadow-inner')
    
    # Selected tab
    text = text.replace("subTab === 'ledger' ? 'bg-white text-slate-900 shadow-sm font-black' :", 
                        "subTab === 'ledger' ? 'bg-white text-slate-900 shadow-[0_4px_12px_rgb(0,0,0,0.05)] font-black' :")
    text = text.replace("subTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm font-black' :", 
                        "subTab === 'analytics' ? 'bg-white text-slate-900 shadow-[0_4px_12px_rgb(0,0,0,0.05)] font-black' :")
    text = text.replace("subTab === 'budgets' ? 'bg-white text-slate-900 shadow-sm font-black' :", 
                        "subTab === 'budgets' ? 'bg-white text-slate-900 shadow-[0_4px_12px_rgb(0,0,0,0.05)] font-black' :")
    text = text.replace("subTab === 'breeding_roi' ? 'bg-white text-slate-900 shadow-sm font-black' :", 
                        "subTab === 'breeding_roi' ? 'bg-white text-slate-900 shadow-[0_4px_12px_rgb(0,0,0,0.05)] font-black' :")
    text = text.replace("subTab === 'granular_analysis' ? 'bg-white text-slate-900 shadow-sm font-black' :", 
                        "subTab === 'granular_analysis' ? 'bg-white text-slate-900 shadow-[0_4px_12px_rgb(0,0,0,0.05)] font-black' :")

    # Clean up input fields for modern light mode
    text = text.replace('border border-slate-200/50 rounded-lg', 'bg-slate-50/50 border border-slate-200/70 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all duration-300')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)

modernize_light('src/components/Financials.tsx')
print('Modern Light UI applied to Financials!')
