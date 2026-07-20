# Food image assets

The product uses a two-level local food-image library:

- `dishes/` contains 35 dish-specific images for popular rice dishes, noodles, drinks, light meals, Japanese food, burgers, fried chicken, and Sichuan food.
- `categories/` contains 17 representative images used only as category fallbacks and for a small number of established core mappings.
- All 52 images were generated specifically for this project with OpenAI's built-in image generation tool.
- The shared brief uses a warm ivory stone background, a close 3/4 overhead angle, soft natural light, centered food, and no logos or text.
- Source files are normalized to at most 1200 px wide and stored as optimized JPEGs for predictable card loading.
- `src/lib/food-image.ts` gives 50 high-frequency dishes unique mappings, then falls back by category, and finally uses `chicken-rice-bowl.jpg` as the global fallback.

Add future images with lowercase kebab-case filenames and update the resolver instead of embedding paths in page components.
