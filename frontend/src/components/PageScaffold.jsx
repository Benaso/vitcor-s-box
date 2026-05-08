import PixelCard from './PixelCard'
import SectionTitle from './SectionTitle'

function PageScaffold({ eyebrow, title, intro, items }) {
  return (
    <div className="content-page">
      <PixelCard style={{ width: '100%' }}>
        <SectionTitle>{eyebrow}</SectionTitle>
        <h1 className="content-page__title">{title}</h1>
        <p className="content-page__intro">{intro}</p>
      </PixelCard>

      <div className="content-page__grid">
        {items.map((item) => (
          <PixelCard key={item.title} style={{ padding: '20px' }}>
            <div className="content-page__item-label">// {item.label}</div>
            <h2 className="content-page__item-title">{item.title}</h2>
            <p className="content-page__item-body">{item.body}</p>
          </PixelCard>
        ))}
      </div>
    </div>
  )
}

export default PageScaffold
