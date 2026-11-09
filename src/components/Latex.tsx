import katex from 'katex'

export default function Latex({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { displayMode: true, throwOnError: false })
  return <div className="text-white" dangerouslySetInnerHTML={{ __html: html }} />
}
