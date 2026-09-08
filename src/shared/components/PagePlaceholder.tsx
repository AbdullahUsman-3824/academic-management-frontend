import type { ReactNode } from 'react'

interface PagePlaceholderProps {
  title: string
  description: string
  children?: ReactNode
}

function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <div className="page-placeholder">
      <h1>{title}</h1>
      <p className="page-placeholder__description">{description}</p>
      <div className="page-placeholder__body">
        {children ?? <p className="page-placeholder__todo">Content coming soon.</p>}
      </div>
    </div>
  )
}

export default PagePlaceholder
