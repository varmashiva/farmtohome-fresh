with open('/Users/shivavarma/Fresh_prown/Fresh_prowns/frontend/src/screens/HomeScreen.jsx', 'r') as f:
    text = f.read()

hero_end = "            {/* Premium Selection Section (Reference Based) */}"
parallax_start = "            {/* Parallax Image Section (Reference Based - \"VORTEX\") */}"
product_start = "            <section className=\"bg-black py-24 px-6 md:px-12 w-full relative\">\n                {/* Subtle radial vignette background */}"
product_end_marker = "            </section>\n        </div>\n    );\n};"

idx_premium_start = text.find(hero_end)
idx_parallax_start = text.find(parallax_start)
idx_product_start = text.find(product_start)
idx_product_end = text.find(product_end_marker) + len("            </section>")

if -1 in [idx_premium_start, idx_parallax_start, idx_product_start, idx_product_end][:3]:
    print("Could not find boundaries")
else:
    part_before = text[:idx_premium_start]
    part_premium = text[idx_premium_start:idx_parallax_start]
    part_parallax = text[idx_parallax_start:idx_product_start]
    part_product = text[idx_product_start:idx_product_end]
    part_after = "\n" + text[idx_product_end:]

    new_text = part_before + part_product + "\n\n" + part_premium + part_parallax.rstrip() + part_after

    with open('/Users/shivavarma/Fresh_prown/Fresh_prowns/frontend/src/screens/HomeScreen.jsx', 'w') as f:
        f.write(new_text)
    print("Successfully reordered!")
