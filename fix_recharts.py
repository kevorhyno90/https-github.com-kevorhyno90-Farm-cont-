import glob
import re

for filepath in glob.glob('src/components/**/*.tsx', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Replace any ResponsiveContainer that doesn't already have minWidth/minHeight
    text = re.sub(
        r'<ResponsiveContainer\s+width=["\']([^"\']+)["\']\s+height=["\']([^"\']+)["\']\s*>',
        r'<ResponsiveContainer width="\1" height="\2" minWidth={0} minHeight={0}>',
        text
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)
print('Fixed Recharts warnings!')
