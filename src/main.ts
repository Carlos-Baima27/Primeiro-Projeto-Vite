import "./style.css";
import { categories, isCategoria, type Categoria, type Despesa } from "./types";

const categoryLabels: Record<Categoria, string> = {
  alimento: "Alimento",
  transporte: "Transporte",
  lazer: "Lazer",
  saúde: "Saúde",
  outros: "Outros",
};
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const expenses: Despesa[] = [];

function getRequiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Elemento obrigatório não encontrado: ${selector}`);
  }
  return element;
}

const form = getRequiredElement<HTMLFormElement>("#expense-form");
const titleInput = getRequiredElement<HTMLInputElement>("#title");
const amountInput = getRequiredElement<HTMLInputElement>("#amount");
const categoryInput = getRequiredElement<HTMLSelectElement>("#category");
const list = getRequiredElement<HTMLUListElement>("#expense-list");
const emptyState = getRequiredElement<HTMLDivElement>("#empty-state");
const totalValue = getRequiredElement<HTMLElement>("#total-value");
const expenseCount = getRequiredElement<HTMLElement>("#expense-count");
const listCount = getRequiredElement<HTMLElement>("#list-count");
const feedback = getRequiredElement<HTMLElement>("#form-feedback");

function setError(field: string, message: string): void {
  const input = getRequiredElement<HTMLElement>(`#${field}`);
  const error = getRequiredElement<HTMLElement>(`#${field}-error`);
  input.classList.toggle("has-error", message !== "");
  input.setAttribute("aria-invalid", String(message !== ""));
  error.textContent = message;
}

function validateForm(): Categoria | null {
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const validCategory = isCategoria(category) ? category : null;
  setError("title", title ? "" : "Informe um título para a despesa.");
  setError(
    "amount",
    amountInput.value && Number.isFinite(amount) && amount > 0
      ? ""
      : "Informe um valor maior que zero.",
  );
  setError(
    "category",
    validCategory ? "" : "Escolha uma categoria válida.",
  );
  return title &&
    amountInput.value &&
    Number.isFinite(amount) &&
    amount > 0
    ? validCategory
    : null;
}

function render(): void {
  const total = expenses.reduce((sum, expense) => sum + expense.valor, 0);
  totalValue.textContent = currency.format(total);
  expenseCount.textContent = `${expenses.length} ${expenses.length === 1 ? "despesa registrada" : "despesas registradas"}`;
  listCount.textContent = `${expenses.length} ${expenses.length === 1 ? "item" : "itens"}`;
  emptyState.hidden = expenses.length > 0;
  list.replaceChildren();
  for (const expense of [...expenses].reverse()) {
    const item = document.createElement("li");
    item.className = "expense-item";
    const icon = document.createElement("div");
    icon.className = "expense-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = categoryLabels[expense.categoria].slice(0, 1);

    const info = document.createElement("div");
    info.className = "expense-info";

    const title = document.createElement("strong");
    title.textContent = expense.titulo;

    const category = document.createElement("span");
    category.textContent = categoryLabels[expense.categoria];
    info.append(title, category);

    const value = document.createElement("strong");
    value.className = "expense-value";
    value.textContent = currency.format(expense.valor);

    item.append(icon, info, value);
    list.append(item);
  }
  for (const category of categories) {
    const categoryTotal = expenses
      .filter((expense) => expense.categoria === category)
      .reduce((sum, expense) => sum + expense.valor, 0);
    getRequiredElement<HTMLElement>(
      `[data-category-total="${category}"]`,
    ).textContent = currency.format(categoryTotal);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  feedback.textContent = "";
  const category = validateForm();
  if (!category) {
    feedback.textContent = "Revise os campos destacados.";
    return;
  }
  expenses.push({
    id: crypto.randomUUID(),
    titulo: titleInput.value.trim(),
    valor: Number(amountInput.value),
    categoria: category,
  });
  render();
  form.reset();
  setError("title", "");
  setError("amount", "");
  setError("category", "");
  feedback.textContent = "Despesa adicionada com sucesso.";
  titleInput.focus();
});

render();
