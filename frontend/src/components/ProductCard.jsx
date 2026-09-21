import { API_ORIGIN } from '../api/axios'

function ProductCard({
  product,
  onSelect,
  onDelete,
  canDelete = false,
  deleting = false,
}) {
  const { name, price, image_url, description } = product

  function handleDelete(event) {
    event.stopPropagation()
    onDelete?.(product)
  }

  return (
    <div className="product-card" onClick={() => onSelect?.(product)}>
      {image_url && (
        <img
          className="product-card__image"
          src={`${API_ORIGIN}${image_url}`}
          alt={name}
        />
      )}
      <h3 className="product-card__title">{name}</h3>
      {description && <p className="product-card__description">{description}</p>}
      <span className="product-card__price">₹{price.toLocaleString('en-IN')}</span>

      {canDelete && (
        <div className="product-card__actions">
          <button
            type="button"
            className="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductCard
