import { useMemo, useState } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Trash2,
  LockKeyhole,
  LayoutDashboard,
  Users,
  Package,
  Download,
  LogOut,
  Pencil,
  X,
  Check,
  TrendingUp,
} from "lucide-react";

const defaultProducts = [
  {
    id: 1,
    name: "Bolo de Milho",
    desc: "Bolo de milho com sabor caseiro, sem glúten e sem lactose.",
    price: 15,
    emoji: "🌽",
    image: "/products/milho.jpg",
    tag: "Caseiro",
  },
  {
    id: 2,
    name: "Torta de Banana",
    desc: "Torta de banana feita com carinho, sem glúten e sem lactose.",
    price: 15,
    emoji: "🍌",
    image: "/products/torta-banana.jpg",
    tag: "Especial",
  },
  {
    id: 3,
    name: "Bolo de Cenoura",
    desc: "Bolo de cenoura macio e saboroso, sem glúten e sem lactose.",
    price: 15,
    emoji: "🥕",
    image: "/products/cenoura.jpg",
    tag: "",
  },
  {
    id: 4,
    name: "Bolo de Chocolate",
    desc: "Bolo de chocolate delicioso, sem glúten e sem lactose.",
    price: 15,
    emoji: "🍫",
    image: "/products/chocolate.jpg",
    tag: "Queridinho",
  },
];

const money = (n) =>
  n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function App() {
  const [page, setPage] = useState(
    window.location.hash === "#admin" ? "adminLogin" : "menu",
  );
  const [products, setProducts] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("tale-produtos") || "null") ||
        defaultProducts
      );
    } catch {
      return defaultProducts;
    }
  });
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tale-pedidos") || "[]");
    } catch {
      return [];
    }
  });
  const [adminUser, setAdminUser] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminTab, setAdminTab] = useState("dashboard");
  const [orderFilter, setOrderFilter] = useState("Todos");
  const [productDraft, setProductDraft] = useState(null);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
  });
  const [delivery, setDelivery] = useState({
    method: "Retirada no local",
    address: "",
    note: "",
  });
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart],
  );

  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  function saveProducts(next) {
    setProducts(next);
    localStorage.setItem("tale-produtos", JSON.stringify(next));
  }

  function openAdmin() {
    window.location.hash = "admin";
    setPage(
      localStorage.getItem("tale-admin-auth") === "true"
        ? "admin"
        : "adminLogin",
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function adminLogin(e) {
    e.preventDefault();
    // Credenciais locais de demonstração. Alteráveis pelo código, não são segurança de servidor.
    const savedUser = localStorage.getItem("tale-admin-user") || "admin";
    const savedPassword =
      localStorage.getItem("tale-admin-password") || "Tale@2026";
    if (adminUser === savedUser && adminPassword === savedPassword) {
      localStorage.setItem("tale-admin-auth", "true");
      setAdminError("");
      setPage("admin");
      setAdminPassword("");
    } else {
      setAdminError("Usuário ou senha incorretos.");
    }
  }

  function logoutAdmin() {
    localStorage.removeItem("tale-admin-auth");
    window.location.hash = "";
    setPage("menu");
  }

  function updateOrderStatus(id, status) {
    const next = orders.map((order) =>
      order.id === id ? { ...order, status } : order,
    );
    setOrders(next);
    localStorage.setItem("tale-pedidos", JSON.stringify(next));
  }

  function exportBackup() {
    const backup = { exportedAt: new Date().toISOString(), products, orders };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tale-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function saveProduct(e) {
    e.preventDefault();
    const item = {
      ...productDraft,
      id: productDraft.id || Date.now(),
      price: Number(productDraft.price),
    };
    const next = productDraft.id
      ? products.map((p) => (p.id === item.id ? item : p))
      : [...products, item];
    saveProducts(next);
    setProductDraft(null);
    setNotice("Produto salvo com sucesso");
    setTimeout(() => setNotice(""), 2200);
  }

  function add(product) {
    setCart((old) =>
      old.some((item) => item.id === product.id)
        ? old.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        )
        : [...old, { ...product, qty: 1 }],
    );

    setNotice(`${product.name} adicionado ao carrinho`);

    setTimeout(() => setNotice(""), 2200);
  }

  function changeQty(id, delta) {
    setCart((old) =>
      old
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item,
        )
        .filter((item) => item.qty > 0),
    );
  }

  function continueToCheckout() {
    if (cart.length) {
      setPage("checkout");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function finishOrder(e) {
    e.preventDefault();

    if (
      !customer.name.trim() ||
      customer.phone.replace(/\D/g, "").length < 10
    ) {
      return;
    }

    if (delivery.method === "Entrega" && !delivery.address.trim()) {
      return;
    }

    const order = {
      id: Date.now(),
      customer: { ...customer },
      items: cart.map(({ id, name, price, qty }) => ({
        id,
        name,
        price,
        qty,
      })),
      total,
      delivery: { ...delivery },
      createdAt: new Date().toLocaleString("pt-BR"),
      status: "Pendente",
    };

    // Demonstração: salva somente neste navegador.
    // Para acessar pedidos de outros dispositivos, será necessário
    // conectar o site a um backend e a um banco de dados.
    const previous = JSON.parse(localStorage.getItem("tale-pedidos") || "[]");

    const nextOrders = [order, ...previous];
    localStorage.setItem("tale-pedidos", JSON.stringify(nextOrders));
    setOrders(nextOrders);

    setLastOrder(order);
    setCart([]);
    setPage("success");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goMenu() {
    setPage("menu");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={goMenu}>
          <span className="logo" style={{ width: '45px', height: '45px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
            <img src="/logo.png" alt="Logo Talê" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </span>

          <span>
            <b>Talê</b>
            <small>Bolos sem Glúten e sem Lactose</small>
          </span>
        </button>

        <div className="top-actions">
          <button
            className="icon-btn"
            title="Painel administrativo"
            onClick={openAdmin}
            aria-label="Painel administrativo"
          >
            <LockKeyhole size={17} />
          </button>
          <button
            className="cart-btn"
            onClick={() =>
              document
                .getElementById("carrinho")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <ShoppingCart size={18} />
            <span>Meu pedido</span>
            <b>{count}</b>
          </button>
        </div>
      </header>

      <main className="main">
        {page === "adminLogin" && (
          <section className="flow-page narrow admin-login-page">
            <div className="form-icon">
              <LockKeyhole size={26} />
            </div>
            <span className="eyebrow blue">ÁREA RESTRITA</span>
            <h1>Painel administrativo</h1>
            <p className="muted">
              Entre para gerenciar pedidos, clientes, produtos e vendas do Talê.
            </p>
            <form className="form" onSubmit={adminLogin}>
              <label>
                Usuário
                <input
                  required
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="Usuário administrativo"
                  autoComplete="username"
                />
              </label>
              <label>
                Senha
                <input
                  required
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Senha"
                  autoComplete="current-password"
                />
              </label>
              {adminError && <p className="error">{adminError}</p>}
              <button className="primary full" type="submit">
                Entrar no painel
              </button>
              <button
                className="back"
                type="button"
                onClick={() => {
                  window.location.hash = "";
                  goMenu();
                }}
              >
                Voltar ao cardápio
              </button>
            </form>
            <p className="demo-warning">
              Acesso inicial local: usuário <b>admin</b> e senha{" "}
              <b>Tale@2026</b>. Troque no código antes de usar. Como a
              autenticação é local, não protege dados contra alguém que
              inspecione o navegador ou o código do site.
            </p>
          </section>
        )}

        {page === "admin" && (
          <section className="admin admin-page">
            <div className="admin-heading">
              <div>
                <span className="eyebrow blue">TALÊ · ADMINISTRAÇÃO</span>
                <h1>Painel administrativo</h1>
                <p className="muted">Gerencie sua operação neste navegador.</p>
              </div>
              <div className="admin-toolbar">
                <button className="secondary-btn" onClick={exportBackup}>
                  <Download size={16} /> Backup
                </button>
                <button className="secondary-btn" onClick={logoutAdmin}>
                  <LogOut size={16} /> Sair
                </button>
              </div>
            </div>
            <nav className="admin-nav">
              {[
                ["dashboard", "Visão geral", LayoutDashboard],
                ["orders", "Pedidos", ShoppingCart],
                ["customers", "Clientes", Users],
                ["products", "Produtos", Package],
              ].map(([key, label, Icon]) => (
                <button
                  key={key}
                  className={adminTab === key ? "active" : ""}
                  onClick={() => setAdminTab(key)}
                >
                  <Icon size={16} />
                  {label}
                  {key === "orders" && <b>{orders.length}</b>}
                </button>
              ))}
            </nav>
            {adminTab === "dashboard" && (
              <>
                <div className="stats">
                  <div className="stat">
                    <span>
                      <ShoppingCart />
                    </span>
                    <small>Total de pedidos</small>
                    <b>{orders.length}</b>
                  </div>
                  <div className="stat">
                    <span>
                      <TrendingUp />
                    </span>
                    <small>Faturamento registrado</small>
                    <b>
                      {money(
                        orders
                          .filter((o) => o.status !== "Cancelado")
                          .reduce((s, o) => s + Number(o.total || 0), 0),
                      )}
                    </b>
                  </div>
                  <div className="stat">
                    <span>
                      <Package />
                    </span>
                    <small>Pedidos pendentes</small>
                    <b>
                      {
                        orders.filter(
                          (o) => (o.status || "Pendente") === "Pendente",
                        ).length
                      }
                    </b>
                  </div>
                  <div className="stat">
                    <span>
                      <Users />
                    </span>
                    <small>Clientes únicos</small>
                    <b>
                      {
                        new Set(
                          orders
                            .map((o) =>
                              (o.customer?.phone || "").replace(/\D/g, ""),
                            )
                            .filter(Boolean),
                        ).size
                      }
                    </b>
                  </div>
                </div>
                <div className="admin-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Pedidos recentes</h2>
                      <p>Os últimos pedidos registrados neste navegador</p>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => setAdminTab("orders")}
                    >
                      Ver todos
                    </button>
                  </div>
                  {orders.length ? (
                    <div className="orders">
                      {orders.slice(0, 5).map((order) => (
                        <div className="order-card" key={order.id}>
                          <div className="order-top">
                            <div>
                              <b>Pedido #{String(order.id).slice(-6)}</b>
                              <small>{order.createdAt}</small>
                            </div>
                            <b>{money(order.total)}</b>
                          </div>
                          <p className="order-customer">
                            {order.customer?.name} · {order.customer?.phone}
                          </p>
                          <span className="order-status">
                            {order.status || "Pendente"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty">
                      <ShoppingCart size={28} />
                      <b>Nenhum pedido por enquanto</b>
                      <p>
                        Quando um pedido for finalizado neste navegador, ele
                        aparecerá aqui.
                      </p>
                    </div>
                  )}
                </div>
                <p className="demo-warning">
                  Dados locais: pedidos feitos em outros dispositivos não
                  aparecem aqui automaticamente. Faça backups regularmente;
                  limpar os dados do navegador pode apagar os registros.
                </p>
              </>
            )}
            {adminTab === "orders" && (
              <div className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Todos os pedidos</h2>
                    <p>Consulte detalhes e atualize o andamento</p>
                  </div>
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                  >
                    <option>Todos</option>
                    {[
                      "Pendente",
                      "Em preparo",
                      "Pronto",
                      "Concluído",
                      "Cancelado",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                {orders.length ? (
                  <div className="orders">
                    {orders
                      .filter(
                        (o) =>
                          orderFilter === "Todos" ||
                          (o.status || "Pendente") === orderFilter,
                      )
                      .map((order) => (
                        <div className="order-card" key={order.id}>
                          <div className="order-top">
                            <div>
                              <b>Pedido #{String(order.id).slice(-6)}</b>
                              <small>{order.createdAt}</small>
                            </div>
                            <b>{money(order.total)}</b>
                          </div>
                          <p className="order-customer">
                            <b>{order.customer?.name}</b> ·{" "}
                            {order.customer?.phone}
                            <br />
                            {order.delivery?.method}
                            {order.delivery?.method === "Entrega"
                              ? ` · ${order.delivery?.address || ""}`
                              : ""}
                            {order.delivery?.note
                              ? ` · Obs.: ${order.delivery.note}`
                              : ""}
                          </p>
                          <div className="order-items">
                            {(order.items || []).map((item, i) => (
                              <span key={`${order.id}-${i}`}>
                                {item.qty}x {item.name} —{" "}
                                {money(item.qty * item.price)}
                              </span>
                            ))}
                          </div>
                          <div className="order-actions">
                            <label>
                              Status
                              <select
                                value={order.status || "Pendente"}
                                onChange={(e) =>
                                  updateOrderStatus(order.id, e.target.value)
                                }
                              >
                                {[
                                  "Pendente",
                                  "Em preparo",
                                  "Pronto",
                                  "Concluído",
                                  "Cancelado",
                                ].map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                            </label>
                            <button
                              className="danger-btn"
                              onClick={() => {
                                if (confirm("Excluir este pedido?")) {
                                  const next = orders.filter(
                                    (o) => o.id !== order.id,
                                  );
                                  setOrders(next);
                                  localStorage.setItem(
                                    "tale-pedidos",
                                    JSON.stringify(next),
                                  );
                                }
                              }}
                            >
                              Excluir pedido
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="admin-empty">
                    <ShoppingCart size={28} />
                    <b>Nenhum pedido registrado</b>
                    <p>Os novos pedidos aparecerão aqui.</p>
                  </div>
                )}
              </div>
            )}
            {adminTab === "customers" && (
              <div className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Clientes</h2>
                    <p>
                      Clientes únicos identificados pelo telefone nos pedidos
                    </p>
                  </div>
                  <span className="count-badge">
                    {
                      new Set(
                        orders
                          .map((o) =>
                            (o.customer?.phone || "").replace(/\D/g, ""),
                          )
                          .filter(Boolean),
                      ).size
                    }{" "}
                    clientes
                  </span>
                </div>
                {(() => {
                  const map = new Map();
                  orders.forEach((o) => {
                    const phone = (o.customer?.phone || "").replace(/\D/g, "");
                    if (!phone) return;
                    if (!map.has(phone))
                      map.set(phone, {
                        name: o.customer?.name || "Cliente",
                        phone: o.customer?.phone || "",
                        orders: [],
                        total: 0,
                      });
                    const c = map.get(phone);
                    c.orders.push(o);
                    if (o.status !== "Cancelado")
                      c.total += Number(o.total || 0);
                  });
                  const clients = [...map.values()].sort((a, b) =>
                    a.name.localeCompare(b.name),
                  );
                  return clients.length ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Cliente</th>
                            <th>Telefone</th>
                            <th>Pedidos</th>
                            <th>Total comprado</th>
                            <th>Última compra</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clients.map((c) => (
                            <tr key={c.phone}>
                              <td>{c.name}</td>
                              <td>{c.phone}</td>
                              <td>{c.orders.length}</td>
                              <td>{money(c.total)}</td>
                              <td>{c.orders[0]?.createdAt || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="admin-empty">
                      <Users size={28} />
                      <b>Nenhum cliente registrado</b>
                      <p>Os clientes serão adicionados ao concluir pedidos.</p>
                    </div>
                  );
                })()}
              </div>
            )}
            {adminTab === "products" && (
              <div className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Produtos do cardápio</h2>
                    <p>Altere nomes, descrições, preços e disponibilidade</p>
                  </div>
                  <button
                    className="primary"
                    onClick={() =>
                      setProductDraft({
                        name: "",
                        desc: "",
                        price: 15,
                        emoji: "🍰",
                        image: "",
                        tag: "",
                      })
                    }
                  >
                    <Plus size={16} /> Novo produto
                  </button>
                </div>
                {productDraft && (
                  <form className="product-editor" onSubmit={saveProduct}>
                    <div className="editor-heading">
                      <b>
                        {productDraft.id ? "Editar produto" : "Novo produto"}
                      </b>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => setProductDraft(null)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="editor-grid">
                      <label>
                        Nome
                        <input
                          required
                          value={productDraft.name}
                          onChange={(e) =>
                            setProductDraft({
                              ...productDraft,
                              name: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Preço (R$)
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={productDraft.price}
                          onChange={(e) =>
                            setProductDraft({
                              ...productDraft,
                              price: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Emoji
                        <input
                          value={productDraft.emoji}
                          onChange={(e) =>
                            setProductDraft({
                              ...productDraft,
                              emoji: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Etiqueta
                        <input
                          value={productDraft.tag}
                          onChange={(e) =>
                            setProductDraft({
                              ...productDraft,
                              tag: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label className="wide">
                        Descrição
                        <input
                          value={productDraft.desc}
                          onChange={(e) =>
                            setProductDraft({
                              ...productDraft,
                              desc: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label className="wide">
                        Caminho da imagem
                        <input
                          placeholder="/products/bolo.jpg"
                          value={productDraft.image}
                          onChange={(e) =>
                            setProductDraft({
                              ...productDraft,
                              image: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                    <button className="primary" type="submit">
                      <Check size={16} /> Salvar produto
                    </button>
                  </form>
                )}
                <div className="orders">
                  {products.map((product) => (
                    <div className="product-admin-row" key={product.id}>
                      <div className="product-admin-emoji">
                        {product.emoji || "🍰"}
                      </div>
                      <div className="product-admin-info">
                        <b>{product.name}</b>
                        <small>{product.desc}</small>
                      </div>
                      <strong>{money(product.price)}</strong>
                      <button
                        className="icon-admin-btn"
                        title="Editar"
                        onClick={() => setProductDraft({ ...product })}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-admin-btn danger"
                        title="Excluir"
                        onClick={() => {
                          if (confirm(`Excluir ${product.name} do cardápio?`))
                            saveProducts(
                              products.filter((p) => p.id !== product.id),
                            );
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {page === "menu" && (
          <>
            <div className="status">
              <span className="live-dot" />
              <b>Estamos prontos para receber seu pedido</b>
              <span>•</span>
              <span>Escolha seus sabores favoritos</span>
            </div>

            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">SABOR E CARINHO EM CADA FATIA</span>

                <h1>
                  Bolos feitos com carinho
                  <br />
                  para você. <span>🍰</span>
                </h1>

                <p>
                  Bolos e tortas sem glúten e sem lactose, feitos para deixar
                  seu dia mais gostoso.
                </p>

                <button
                  className="primary"
                  onClick={() =>
                    document
                      .getElementById("cardapio")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Ver cardápio
                </button>
              </div>

              <div className="hero-art">
                <div className="sun" />
                <div className="food-emoji" style={{ width: '280px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/products/bolos-destaque.jpg" alt="Bolos e tortas Talê" style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }} />
                </div>

                <div className="hero-sticker">
                  FEITO
                  <br />
                  <b>COM CARINHO!</b>
                </div>

                <div className="hero-caption">um pedacinho de felicidade ♡</div>
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
                  <span className="eyebrow blue">ESCOLHA O SEU</span>

                  <h2>Nosso cardápio</h2>

                  <p>Bolos e tortas sem glúten e sem lactose.</p>
                </div>

                <label className="search">
                  <Search size={17} />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar sabor..."
                  />
                </label>
              </div>

              <div className="products">
                {filtered.map((product) => (
                  <article className="product" key={product.id}>
                    <div className={`product-image image-${product.id}`}>
                      <span className="food">{product.emoji}</span>

                      <img
                        className="product-photo"
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />

                      {product.tag && (
                        <span className="tag">{product.tag}</span>
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
                  <span className="eyebrow blue">SEU PEDIDO</span>
                  <h2>Meu carrinho</h2>
                </div>

                <span className="count-badge">
                  {count} {count === 1 ? "item" : "itens"}
                </span>
              </div>

              {cart.length ? (
                <>
                  <div className="cart-list">
                    {cart.map((item) => (
                      <div className="cart-row" key={item.id}>
                        <div className={`mini-image image-${item.id}`}>
                          {item.emoji}
                        </div>

                        <div className="cart-name">
                          <b>{item.name}</b>
                          <small>{money(item.price)} cada</small>
                        </div>

                        <div className="quantity">
                          <button
                            onClick={() => changeQty(item.id, -1)}
                            aria-label="Diminuir"
                          >
                            <Minus size={14} />
                          </button>

                          <b>{item.qty}</b>

                          <button
                            onClick={() => changeQty(item.id, 1)}
                            aria-label="Aumentar"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <strong>{money(item.price * item.qty)}</strong>

                        <button
                          className="remove-btn"
                          aria-label="Remover item"
                          onClick={() =>
                            setCart((old) =>
                              old.filter((i) => i.id !== item.id),
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

                  <button className="primary full" onClick={continueToCheckout}>
                    Continuar para os dados
                    <ArrowLeft className="flip" size={17} />
                  </button>
                </>
              ) : (
                <div className="cart-empty">
                  <ShoppingCart size={26} />
                  <p>
                    Seu carrinho está vazio. Adicione um bolo ou uma torta para
                    começar!
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        {page === "checkout" && (
          <section className="flow-page narrow">
            <button className="back" onClick={goMenu}>
              <ArrowLeft size={16} />
              Voltar ao cardápio
            </button>

            <span className="eyebrow blue">ÚLTIMO PASSO</span>
            <h1>Finalizar pedido</h1>

            <p className="muted">
              Preencha seus dados para identificarmos seu pedido e entrarmos em
              contato, se necessário.
            </p>

            <div className="checkout-summary">
              <div className="summary-title">
                <b>Resumo do pedido</b>
                <button onClick={goMenu}>Editar carrinho</button>
              </div>

              {cart.map((item) => (
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
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      name: e.target.value,
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
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      phone: e.target.value,
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
                  onChange={(e) =>
                    setDelivery({
                      ...delivery,
                      method: e.target.value,
                    })
                  }
                >
                  <option>Retirada no local</option>
                  <option>Entrega</option>
                </select>
              </label>

              {delivery.method === "Entrega" && (
                <label>
                  Endereço de entrega
                  <textarea
                    required
                    rows="3"
                    value={delivery.address}
                    onChange={(e) =>
                      setDelivery({
                        ...delivery,
                        address: e.target.value,
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
                  onChange={(e) =>
                    setDelivery({
                      ...delivery,
                      note: e.target.value,
                    })
                  }
                  placeholder="Alguma observação sobre o pedido?"
                />
              </label>

              <div className="privacy">
                <Phone size={17} />
                <span>
                  Seus dados serão usados para identificar seu pedido e entrar
                  em contato sobre a compra.
                </span>
              </div>

              <button className="primary full" type="submit">
                Confirmar pedido · {money(total)}
              </button>
            </form>
          </section>
        )}

        {page === "success" && (
          <section className="flow-page narrow success">
            <div className="success-check">
              <CheckCircle2 size={46} />
            </div>

            <span className="eyebrow blue">TUDO CERTO!</span>
            <h1>Pedido confirmado 🎉</h1>

            <p className="muted">
              Obrigado, {lastOrder?.customer.name}! Recebemos seu pedido. Em
              breve entraremos em contato pelo telefone informado.
            </p>

            <div className="order-number">
              Pedido #{String(lastOrder?.id || "").slice(-6)}
              <span>{lastOrder?.createdAt}</span>
            </div>

            <div className="checkout-summary">
              {lastOrder?.items.map((item) => (
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
                {lastOrder?.delivery.method === "Entrega"
                  ? ` · ${lastOrder.delivery.address}`
                  : ""}
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
