import "./style.css";
import { fromCents, sumInCents } from "./money";
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
const submitButton = getRequiredElement<HTMLButtonElement>(
  "#expense-form button[type='submit']",
);
const cancelButton = getRequiredElement<HTMLButtonElement>("#form-cancel");
let editingId: string | null = null;

function setError(field: string, message: string): void {
  const input = getRequiredElement<HTMLElement>(`#${field}`);
  const error = getRequiredElement<HTMLElement>(`#${field}-error`);
  input.classList.toggle("has-error", message !== "");
  input.setAttribute("aria-invalid", String(message !== ""));
  error.textContent = message;
}

function clearErrors(): void {
  setError("title", "");
  setError("amount", "");
  setError("category", "");
}

function updateSubmitButtonLabel(): void {
  submitButton.innerHTML =
    editingId !== null
      ? "Salvar alterações"
      : 'Adicionar despesa <span aria-hidden="true">+</span>';
  cancelButton.hidden = editingId === null;
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

function startEditing(id: string): void {
  const expense = expenses.find((item) => item.id === id);
  if (!expense) {
    return;
  }

  editingId = id;
  titleInput.value = expense.titulo;
  amountInput.value = String(expense.valor);
  categoryInput.value = expense.categoria;
  clearErrors();
  updateSubmitButtonLabel();
  feedback.textContent = "Editando despesa selecionada.";
  titleInput.focus();
}

function cancelEditing(): void {
  editingId = null;
  form.reset();
  clearErrors();
  updateSubmitButtonLabel();
  feedback.textContent = "Edição cancelada.";
  titleInput.focus();
}

function removeExpense(id: string): void {
  const expense = expenses.find((item) => item.id === id);
  if (!expense) {
    return;
  }

  const shouldRemove = window.confirm(`Excluir despesa "${expense.titulo}"?`);
  if (!shouldRemove) {
    return;
  }

  const index = expenses.findIndex((item) => item.id === id);
  if (index === -1) {
    return;
  }

  expenses.splice(index, 1);
  render();
  if (editingId === id) {
    cancelEditing();
  }
  feedback.textContent = "Despesa removida com sucesso.";
}

function render(): void {
  const total = fromCents(sumInCents(expenses.map((expense) => expense.valor)));
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

    const actions = document.createElement("div");
    actions.className = "expense-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-button";
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => startEditing(expense.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Excluir";
    deleteButton.addEventListener("click", () => removeExpense(expense.id));

    actions.append(editButton, deleteButton);
    item.append(icon, info, value, actions);
    list.append(item);
  }
  for (const category of categories) {
    const categoryTotal = fromCents(
      sumInCents(
        expenses
          .filter((expense) => expense.categoria === category)
          .map((expense) => expense.valor),
      ),
    );
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

  if (editingId !== null) {
    const index = expenses.findIndex((expense) => expense.id === editingId);
    if (index >= 0) {
      expenses[index] = {
        ...expenses[index],
        titulo: titleInput.value.trim(),
        valor: Number(amountInput.value),
        categoria: category,
      };
    }
    feedback.textContent = "Despesa atualizada com sucesso.";
  } else {
    expenses.push({
      id: crypto.randomUUID(),
      titulo: titleInput.value.trim(),
      valor: Number(amountInput.value),
      categoria: category,
    });
    feedback.textContent = "Despesa adicionada com sucesso.";
  }

  render();
  editingId = null;
  form.reset();
  clearErrors();
  updateSubmitButtonLabel();
  titleInput.focus();
});

cancelButton.addEventListener("click", () => {
  cancelEditing();
});

updateSubmitButtonLabel();
render();
