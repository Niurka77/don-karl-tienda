export default function AdvisorySection({ title, description, ctaText, image, backgroundColor = '#FDF0F3' }) {
  const hasContent = title || description || ctaText
  const hasImage = Boolean(image)

  if (!hasContent && !hasImage) return null

  return (
    <section className="w-full" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch">
        {hasImage && (
          <div className="w-full md:w-1/2 min-h-[300px] md:min-h-[500px]">
            <img
              src={image}
              alt={title || ''}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className={`flex flex-col justify-center px-8 py-16 md:px-16 ${hasImage ? 'md:w-1/2' : 'md:w-full'}`}>
          {title && (
            <h2 className="font-display text-3xl md:text-5xl font-light text-kb-obsidian leading-tight mb-6">
              {title}
            </h2>
          )}
          {description && (
            <p className="font-sans text-sm md:text-base text-kb-obsidian/70 font-light leading-relaxed mb-10 max-w-lg">
              {description}
            </p>
          )}
          {ctaText && (
            <button className="self-start bg-kb-obsidian text-white px-10 py-4 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 hover:bg-kb-obsidian/90">
              {ctaText}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
