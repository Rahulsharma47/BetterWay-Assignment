
---

# 🛍️ Modern Store – React E-Commerce UI

A modern, production-grade e-commerce frontend built with **React**, **Context API**, and **Tailwind CSS**, showcasing advanced UI/UX patterns used in real-world applications like Amazon, Stripe, and Netflix.

This project focuses on **component composition, state management, performance optimizations, and polished UX** rather than backend complexity.

---

## ✨ Features

### 🧩 Architecture & State

* Context-based state management (Theme, Cart, Toast)
* Clean provider composition
* LocalStorage persistence (cart & theme)
* Debounced search for performance

### 🎨 UI / UX

* Fully responsive layout
* Dark & Light mode with smooth transitions
* Product Quick View modal
* Slide-in cart drawer
* Filter chips with instant feedback
* Toast notifications (success / warning / error)
* Skeleton loaders (industry-standard pattern)

### 🛒 E-Commerce Functionality

* Product listing from external API
* Category filtering
* Price sorting (Low → High, High → Low)
* Stock-aware cart logic
* Quantity control with stock limits
* Cart total calculation

### ⚡ Performance Optimizations

* `useMemo` for filtered/sorted products
* `useCallback` for stable handlers
* Debounced search input
* Minimal re-renders

---

## 🧱 Tech Stack

| Technology    | Usage                   |
| ------------- | ----------------------- |
| React         | Component-based UI      |
| Tailwind CSS  | Styling & dark mode     |
| Context API   | Global state management |
| Lucide Icons  | Icons                   |
| DummyJSON API | Product data            |
| LocalStorage  | Persistence             |

---

## 📂 Project Structure (Simplified)

```
src/
│
├── contexts/
│   ├── ThemeContext
│   ├── CartContext
│   └── ToastContext
│
├── hooks/
│   ├── useProducts
│   └── useDebounce
│
├── components/
│   ├── ProductCard
│   ├── ProductModal
│   ├── Cart
│   ├── FilterBar
│   ├── SkeletonCard
│   └── ProductImage
│
├── App.jsx
└── main.jsx
```

> *Note: In this version everything may live in one file for demonstration clarity, but it is designed to scale modularly.*

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/modern-store.git
cd modern-store
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the app

```bash
npm run dev
```

Open:
👉 `http://localhost:5173`

---

## 🌙 Dark Mode

* Theme preference is saved in `localStorage`
* Automatically applies Tailwind’s `dark` class
* Smooth color transitions across the app
* Unified dark canvas background for visual consistency

---

## 🧠 Design Decisions

* **Context API** chosen over Redux for simplicity and clarity
* **Skeleton loaders** instead of spinners for better perceived performance
* **Quick View modal** to reduce navigation friction
* **Filter chips** to make active filters obvious and removable
* **Stock-aware cart logic** to prevent invalid actions

---

## 🔮 Future Improvements

* Checkout & payment flow
* Pagination / infinite scrolling
* Authentication
* Wishlist feature
* Accessibility audit (ARIA roles, keyboard navigation)
* Backend integration

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 🙌 Acknowledgements

* Product data from [DummyJSON](https://dummyjson.com/)
* Icons by [Lucide](https://lucide.dev/)
* UI inspiration from modern SaaS & e-commerce platforms

---

### ⭐ If you’re reviewing this as a recruiter or interviewer:

This project intentionally demonstrates **real-world frontend patterns**, not just basic React usage.

---
