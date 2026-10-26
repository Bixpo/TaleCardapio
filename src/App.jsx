
import { useMemo, useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Trash2
} from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Bolo de Milho',
    desc: 'Bolo de milho com sabor caseiro, sem glúten e sem lactose.',
    price: 15,
    emoji: '🌽',
    image: '/products/milho.jpg',
    tag: 'Caseiro'
  },
  {
    id: 2,
    name: 'Torta de Banana',
    desc: 'Torta de banana feita com carinho, sem glúten e sem lactose.',
    price: 15,
    emoji: '🍌',
    image: '/products/torta-banana.jpg',
    tag: 'Especial'
  },
  {
    id: 3,
    name: 'Bolo de Cenoura',
    desc: 'Bolo de cenoura macio e saboroso, sem glúten e sem lactose.',
    price: 15,
    emoji: '🥕',
    image: '/products/cenoura.jpg',
    tag: ''
  },
  {
    id: 4,
    name: 'Bolo de Chocolate',
    desc: 'Bolo de chocolate delicioso, sem glúten e sem lactose.',
    price: 15,
    emoji: '🍫',
    image: '/products/chocolate.jpg',
    tag: 'Queridinho'
  },
];

const money = n =>
  n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

export default function App() {
  const [page, setPage] = useState('menu');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: '',
    phone: ''
  });
  const [delivery, setDelivery] = useState({
    method: 'Retirada no local',
    address: '',
    note: ''
  });
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [lastOrder, setLastOrder] = useState(null);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      ),
    [cart]
  );

  const count = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  function add(product) {
    setCart(old =>
      old.some(item => item.id === product.id)
        ? old.map(item =>
            item.id === product.id
              ? { ...item, qty: item.qty + 1 }
              : item
          )
        : [...old, { ...product, qty: 1 }]
    );

    setNotice(`${product.name} adicionado ao carrinho`);

    setTimeout(() => setNotice(''), 2200);
  }

  function changeQty(id, delta) {
    setCart(old =>
      old
        .map(item =>
          item.id === id
            ? { ...item, qty: item.qty + delta }
            : item
        )
        .filter(item => item.qty > 0)
    );
  }

  function continueToCheckout() {
    if (cart.length) {
      setPage('checkout');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function finishOrder(e) {
    e.preventDefault();

    if (
      !customer.name.trim() ||
      customer.phone.replace(/\D/g, '').length < 10
    ) {
      return;
    }

    if (
      delivery.method === 'Entrega' &&
      !delivery.address.trim()
    ) {
      return;
    }

    const order = {
      id: Date.now(),
      customer: { ...customer },
      items: cart.map(({ id, name, price, qty }) => ({
        id,
        name,
        price,
        qty
      })),
      total,
      delivery: { ...delivery },
      createdAt: new Date().toLocaleString('pt-BR')
    };

    // Demonstração: salva somente neste navegador.
    // Para acessar pedidos de outros dispositivos, será necessário
    // conectar o site a um backend e a um banco de dados.
    const previous = JSON.parse(
      localStorage.getItem('tale-pedidos') || '[]'
    );

    localStorage.setItem(
      'tale-pedidos',
      JSON.stringify([order, ...previous])
    );

    setLastOrder(order);
    setCart([]);
    setPage('success');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goMenu() {
    setPage('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={goMenu}>
          <span className="logo">T</span>

          <span>
            <b>Talê</b>
            <small>Bolos sem Glúten e sem Lactose</small>
          </span>
        </button>

        <div className="top-actions">
          <button
            className="cart-btn"
            onClick={() =>
              document
                .getElementById('carrinho')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <ShoppingCart size={18} />
            <span>Meu pedido</span>
            <b>{count}</b>
          </button>
        </div>
      </header>

      <main className="main">
        {page === 'menu' && (
          <>
            <div className="status">
              <span className="live-dot" />
              <b>Estamos prontos para receber seu pedido</b>
              <span>•</span>
              <span>Escolha seus sabores favoritos</span>
            </div>

            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">
                  SABOR E CARINHO EM CADA FATIA
                </span>

                <h1>
                  Bolos feitos com carinho
                  <br />
                  para você. <span>🍰</span>
                </h1>

                <p>
                  Bolos e tortas sem glúten e sem lactose,
                  feitos para deixar seu dia mais gostoso.
                </p>

                <button
                  className="primary"
                  onClick={() =>
                    document
                      .getElementById('cardapio')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Ver cardápio
                </button>
              </div>

              <div className="hero-art">
                <div className="sun" />
                <div className="food-emoji">🍰</div>

                <div className="hero-sticker">
                  FEITO
                  <br />
                  <b>COM CARINHO!</b>
                </div>

                <div className="hero-caption">
                  um pedacinho de felicidade ♡
                </div>
              </div>
            </section>

            <div className="promo">
              <div className="promo-icon">✨</div>

              <div>
                <b>Um sabor especial para o seu dia</b>
                <p>4 opções deliciosas por R$ 15 cada</p>
              </div>

              <span className="promo-pill">Peça agora</span>
            </div>

            <section id="cardapio" className="menu-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow blue">
                    ESCOLHA O SEU
                  </span>

                  <h2>Nosso cardápio</h2>

                  <p>
                    Bolos e tortas sem glúten e sem lactose.
                  </p>
                </div>

                <label className="search">
                  <Search size={17} />

                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar sabor..."
                  />
                </label>
              </div>

              <div className="products">
                {filtered.map(product => (
                  <article
                    className="product"
                    key={product.id}
                  >
                    <div
                      className={`product-image image-${product.id}`}
                    >
                      <span className="food">
                        {product.emoji}
                      </span>

                      <img
                        className="product-photo"
                        src={product.image}
                        alt={product.name}
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />

                      {product.tag && (
                        <span className="tag">
                          {product.tag}
                        </span>
                      )}
                    </div>

                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p>{product.desc}</p>

                      <div className="product-bottom">
                        <b>{money(product.price)}</b>

                        <button
                          className="add-btn"
                          onClick={() => add(product)}
                        >
                          <Plus size={17} />
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

                {filtered.length === 0 && (
                  <p className="muted">
                    Nenhum sabor encontrado. Tente outra busca.
                  </p>
                )}
              </div>
            </section>

            <section className="how">
              <div>
                <span className="how-icon">🍰</span>
                <b>Feito com carinho</b>
                <small>Preparado com atenção</small>
              </div>

              <div>
                <span className="how-icon">
                  <ShoppingCart />
                </span>
                <b>Pedido fácil</b>
                <small>Escolha e finalize online</small>
              </div>

              <div>
                <span className="how-icon">
                  <Phone />
                </span>
                <b>Contato simples</b>
                <small>Informe seu nome e telefone</small>
              </div>
            </section>

            <section className="cart-panel" id="carrinho">
              <div className="cart-panel-heading">
                <div>
                  <span className="eyebrow blue">
                    SEU PEDIDO
                  </span>
                  <h2>Meu carrinho</h2>
                </div>

                <span className="count-badge">
                  {count} {count === 1 ? 'item' : 'itens'}
                </span>
              </div>

              {cart.length ? (
                <>
                  <div className="cart-list">
                    {cart.map(item => (
                      <div className="cart-row" key={item.id}>
                        <div
                          className={`mini-image image-${item.id}`}
                        >
                          {item.emoji}
                        </div>

                        <div className="cart-name">
                          <b>{item.name}</b>
                          <small>{money(item.price)} cada</small>
                        </div>

                        <div className="quantity">
                          <button
                            onClick={() =>
                              changeQty(item.id, -1)
                            }
                            aria-label="Diminuir"
                          >
                            <Minus size={14} />
                          </button>

                          <b>{item.qty}</b>

                          <button
                            onClick={() =>
                              changeQty(item.id, 1)
                            }
                            aria-label="Aumentar"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <strong>
                          {money(item.price * item.qty)}
                        </strong>

                        <button
                          className="remove-btn"
                          aria-label="Remover item"
                          onClick={() =>
                            setCart(old =>
                              old.filter(
                                i => i.id !== item.id
                              )
                            )
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="total-row">
                    <span>Total do pedido</span>
                    <b>{money(total)}</b>
                  </div>

                  <button
                    className="primary full"
                    onClick={continueToCheckout}
                  >
                    Continuar para os dados
                    <ArrowLeft className="flip" size={17} />
                  </button>
                </>
              ) : (
                <div className="cart-empty">
                  <ShoppingCart size={26} />
                  <p>
                    Seu carrinho está vazio. Adicione um bolo
                    ou uma torta para começar!
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        {page === 'checkout' && (
          <section className="flow-page narrow">
            <button className="back" onClick={goMenu}>
              <ArrowLeft size={16} />
              Voltar ao cardápio
            </button>

            <span className="eyebrow blue">ÚLTIMO PASSO</span>
            <h1>Finalizar pedido</h1>

            <p className="muted">
              Preencha seus dados para identificarmos seu
              pedido e entrarmos em contato, se necessário.
            </p>

            <div className="checkout-summary">
              <div className="summary-title">
                <b>Resumo do pedido</b>
                <button onClick={goMenu}>
                  Editar carrinho
                </button>
              </div>

              {cart.map(item => (
                <div className="summary-item" key={item.id}>
                  <span>
                    {item.qty}x {item.name}
                  </span>
                  <b>{money(item.qty * item.price)}</b>
                </div>
              ))}

              <div className="total-row">
                <span>Total</span>
                <b>{money(total)}</b>
              </div>
            </div>

            <form className="form" onSubmit={finishOrder}>
              <label>
                Seu nome
                <input
                  required
                  autoFocus
                  value={customer.name}
                  onChange={e =>
                    setCustomer({
                      ...customer,
                      name: e.target.value
                    })
                  }
                  placeholder="Como podemos te chamar?"
                />
              </label>

              <label>
                WhatsApp / telefone
                <input
                  required
                  type="tel"
                  value={customer.phone}
                  onChange={e =>
                    setCustomer({
                      ...customer,
                      phone: e.target.value
                    })
                  }
                  placeholder="(00) 00000-0000"
                  minLength="10"
                />
              </label>

              <label>
                Forma de recebimento
                <select
                  value={delivery.method}
                  onChange={e =>
                    setDelivery({
                      ...delivery,
                      method: e.target.value
                    })
                  }
                >
                  <option>Retirada no local</option>
                  <option>Entrega</option>
                </select>
              </label>

              {delivery.method === 'Entrega' && (
                <label>
                  Endereço de entrega
                  <textarea
                    required
                    rows="3"
                    value={delivery.address}
                    onChange={e =>
                      setDelivery({
                        ...delivery,
                        address: e.target.value
                      })
                    }
                    placeholder="Rua, número, bairro e complemento"
                  />
                </label>
              )}

              <label>
                Observações (opcional)
                <textarea
                  rows="2"
                  value={delivery.note}
                  onChange={e =>
                    setDelivery({
                      ...delivery,
                      note: e.target.value
                    })
                  }
                  placeholder="Alguma observação sobre o pedido?"
                />
              </label>

              <div className="privacy">
                <Phone size={17} />
                <span>
                  Seus dados serão usados para identificar
                  seu pedido e entrar em contato sobre a compra.
                </span>
              </div>

              <button className="primary full" type="submit">
                Confirmar pedido · {money(total)}
              </button>
            </form>
          </section>
        )}

        {page === 'success' && (
          <section className="flow-page narrow success">
            <div className="success-check">
              <CheckCircle2 size={46} />
            </div>

            <span className="eyebrow blue">TUDO CERTO!</span>
            <h1>Pedido confirmado 🎉</h1>

            <p className="muted">
              Obrigado, {lastOrder?.customer.name}!
              Recebemos seu pedido. Em breve entraremos em
              contato pelo telefone informado.
            </p>

            <div className="order-number">
              Pedido #{String(lastOrder?.id || '').slice(-6)}
              <span>{lastOrder?.createdAt}</span>
            </div>

            <div className="checkout-summary">
              {lastOrder?.items.map(item => (
                <div className="summary-item" key={item.id}>
                  <span>
                    {item.qty}x {item.name}
                  </span>
                  <b>{money(item.qty * item.price)}</b>
                </div>
              ))}

              <div className="total-row">
                <span>Total</span>
                <b>{money(lastOrder?.total || 0)}</b>
              </div>

              <p className="muted tiny">
                {lastOrder?.delivery.method}
                {lastOrder?.delivery.method === 'Entrega'
                  ? ` · ${lastOrder.delivery.address}`
                  : ''}
              </p>
            </div>

            <button className="primary full" onClick={goMenu}>
              Voltar ao cardápio
            </button>
          </section>
        )}
      </main>

      <footer>
        <div className="footer-brand">
          <span className="logo">T</span>
          <b>Talê - Bolos sem Glúten e sem Lactose</b>
        </div>

        <p>Bolos e tortas feitos com carinho. ♡</p>
        <small>© 2026 · Talê</small>
      </footer>

      {notice && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}
    </div>
  );
}
