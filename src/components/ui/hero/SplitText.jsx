const SplitText = ({
  text,
  delay = 0,
  animate,
  className = '',
  style = {},
  as: Tag = 'span',
}) => {
  const words = text.split(' ')
  return (
    <Tag className={className} style={style}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'top',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              transform: animate ? 'translateY(0)' : 'translateY(110%)',
              opacity: animate ? 1 : 0,
              transition: `transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay + i * 0.08}s, opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay + i * 0.08}s`,
            }}
          >
            {word}
          </span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </Tag>
  )
}

export default SplitText
