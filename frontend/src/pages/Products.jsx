import { useEffect, useState } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import AddProductModal from '../components/AddProductModal'
import { useAuth } from '../context/AuthContext'

const LIMIT = 12

function Products({ currentUser: propUser, filter = 'all' }) {
  const { user: authUser } = useAuth()
  const currentUser = propUser || authUser
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  // Bumped to refetch the page currently on screen.
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchProducts() {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get('/products', {
          params: { page, limit: LIMIT },
        })
        if (cancelled) return
        setProducts(data.items ?? [])
        setTotalPages(data.total_pages ?? 1)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProducts()
    return () => {
      cancelled = true
    }
  }, [page, refreshKey])

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name.trim()}"?`)) return

    setError('')
    setDeletingId(product.id)

    try {
      await api.delete(`/products/${product.id}`)
      setProducts((current) => current.filter((p) => p.id !== product.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  // New products land at the end of the list, so jump to the last page to
  // show the one just created.
  async function handleCreated() {
    setShowAdd(false)
    const { data } = await api.get('/products', { params: { page: 1, limit: LIMIT } })
    const lastPage = data.total_pages ?? 1
    if (lastPage === page) setRefreshKey((k) => k + 1)
    else setPage(lastPage)
  }

  const displayedProducts = filter === 'my'
    ? products.filter((p) => p.owner_id === currentUser?.id)
    : products

  return (
    <section className="products">
      <div className="products__header">
        <h1>{filter === 'my' ? 'My Products' : 'All Products'}</h1>
        <button onClick={() => setShowAdd(true)}>+ Add product</button>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading products…</p>
      ) : (
        <>
          <div className="products__grid">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                canDelete={product.owner_id === currentUser?.id}
                onDelete={handleDelete}
                deleting={deletingId === product.id}
              />
            ))}
          </div>
          {displayedProducts.length === 0 && !loading && (
            <p className="products__empty">
              {filter === 'my' ? 'You have not added any products yet.' : 'No products found.'}
            </p>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onCreated={handleCreated}
        />
      )}
    </section>
  )
}

export default Products
