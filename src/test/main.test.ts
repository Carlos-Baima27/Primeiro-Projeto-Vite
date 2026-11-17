import { beforeEach, describe, expect, it, vi } from "vitest";

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Test element not found: ${selector}`);
  }
  return element;
}

function submitExpense(): void {
  getElement<HTMLFormElement>("#expense-form").requestSubmit();
}

describe("expense form", () => {
  beforeEach(async () => {
    document.body.innerHTML = `
      <form id="expense-form" novalidate>
        <input id="title" />
        <small id="title-error"></small>
        <input id="amount" type="number" />
        <small id="amount-error"></small>
        <select id="category">
          <option value="">Select</option>
          <option value="alimento">Alimento</option>
          <option value="transporte">Transporte</option>
          <option value="lazer">Lazer</option>
          <option value="saúde">Saúde</option>
          <option value="outros">Outros</option>
        </select>
        <small id="category-error"></small>
        <p id="form-feedback"></p>
        <button id="form-cancel" type="button" hidden>Cancelar</button>
        <button type="submit">Add</button>
      </form>
      <ul id="expense-list"></ul>
      <div id="empty-state"></div>
      <strong id="total-value"></strong>
      <span id="expense-count"></span>
      <span id="list-count"></span>
      <strong data-category-total="alimento"></strong>
      <strong data-category-total="transporte"></strong>
      <strong data-category-total="lazer"></strong>
      <strong data-category-total="saúde"></strong>
      <strong data-category-total="outros"></strong>
    `;
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => "expense-test-id"),
    });
    vi.resetModules();
    await import("../main");
  });

  it("shows the empty state and zero totals initially", () => {
    expect(getElement<HTMLDivElement>("#empty-state").hidden).toBe(false);
    expect(getElement<HTMLUListElement>("#expense-list").children).toHaveLength(0);
    expect(getElement<HTMLElement>("#total-value").textContent).toContain("0,00");
    for (const category of [
      "alimento",
      "transporte",
      "lazer",
      "saúde",
      "outros",
    ]) {
      expect(
        getElement<HTMLElement>(`[data-category-total="${category}"]`)
          .textContent,
      ).toContain("0,00");
    }
  });

  it("rejects blank titles, invalid amounts, and unsupported categories", () => {
    getElement<HTMLInputElement>("#title").value = "   ";
    getElement<HTMLInputElement>("#amount").value = "10";
    getElement<HTMLSelectElement>("#category").value = "alimento";
    submitExpense();
    expect(getElement<HTMLElement>("#title-error").textContent).toMatch(
      /título/,
    );

    getElement<HTMLInputElement>("#title").value = "Compra";
    getElement<HTMLInputElement>("#amount").value = "";
    submitExpense();
    expect(getElement<HTMLElement>("#amount-error").textContent).toMatch(
      /maior que zero/,
    );

    getElement<HTMLInputElement>("#amount").value = "-1";
    submitExpense();
    expect(getElement<HTMLElement>("#amount-error").textContent).toMatch(
      /maior que zero/,
    );

    getElement<HTMLInputElement>("#amount").value = "0";
    submitExpense();
    expect(getElement<HTMLElement>("#amount-error").textContent).toMatch(
      /maior que zero/,
    );

    getElement<HTMLInputElement>("#amount").type = "text";
    getElement<HTMLInputElement>("#amount").value = "not-a-number";
    submitExpense();
    expect(getElement<HTMLElement>("#amount-error").textContent).toMatch(
      /maior que zero/,
    );

    getElement<HTMLInputElement>("#amount").value = "10";
    const categoryInput = getElement<HTMLSelectElement>("#category");
    categoryInput.add(new Option("Unknown", "unknown"));
    categoryInput.value = "unknown";
    submitExpense();
    expect(getElement<HTMLElement>("#category-error").textContent).toMatch(
      /categoria válida/,
    );

    expect(
      getElement<HTMLUListElement>("#expense-list").children,
    ).toHaveLength(0);
    expect(getElement<HTMLElement>("#total-value").textContent).toContain(
      "0,00",
    );
    expect(getElement<HTMLDivElement>("#empty-state").hidden).toBe(false);
  });

  it("adds valid expenses and updates overall and category totals", () => {
    getElement<HTMLInputElement>("#title").value = "Mercado";
    getElement<HTMLInputElement>("#amount").value = "25.50";
    getElement<HTMLSelectElement>("#category").value = "alimento";
    submitExpense();

    getElement<HTMLInputElement>("#title").value = "Ônibus";
    getElement<HTMLInputElement>("#amount").value = "10";
    getElement<HTMLSelectElement>("#category").value = "transporte";
    submitExpense();

    const expenses = getElement<HTMLUListElement>("#expense-list");
    expect(expenses.children).toHaveLength(2);
    expect(expenses.textContent).toContain("Mercado");
    expect(expenses.textContent).toContain("Ônibus");
    expect(expenses.children[0].textContent).toContain("Ônibus");
    expect(getElement<HTMLDivElement>("#empty-state").hidden).toBe(true);
    expect(getElement<HTMLElement>("#total-value").textContent).toContain(
      "35,50",
    );
    expect(
      getElement<HTMLElement>('[data-category-total="alimento"]').textContent,
    ).toContain("25,50");
    expect(
      getElement<HTMLElement>('[data-category-total="transporte"]').textContent,
    ).toContain("10,00");
    expect(
      getElement<HTMLElement>('[data-category-total="lazer"]').textContent,
    ).toContain("0,00");
    expect(getElement<HTMLInputElement>("#title").value).toBe("");
    expect(document.activeElement).toBe(getElement<HTMLInputElement>("#title"));
  });

  it("calculates decimal totals overall and by category", () => {
    getElement<HTMLInputElement>("#title").value = "Café";
    getElement<HTMLInputElement>("#amount").value = "0.10";
    getElement<HTMLSelectElement>("#category").value = "alimento";
    submitExpense();

    getElement<HTMLInputElement>("#title").value = "Pão";
    getElement<HTMLInputElement>("#amount").value = "0.20";
    getElement<HTMLSelectElement>("#category").value = "alimento";
    submitExpense();

    getElement<HTMLInputElement>("#title").value = "Ônibus";
    getElement<HTMLInputElement>("#amount").value = "1.5";
    getElement<HTMLSelectElement>("#category").value = "transporte";
    submitExpense();

    expect(getElement<HTMLElement>("#total-value").textContent).toContain(
      "1,80",
    );
    expect(
      getElement<HTMLElement>('[data-category-total="alimento"]').textContent,
    ).toContain("0,30");
    expect(
      getElement<HTMLElement>('[data-category-total="transporte"]').textContent,
    ).toContain("1,50");
    expect(
      getElement<HTMLElement>('[data-category-total="lazer"]').textContent,
    ).toContain("0,00");
    expect(getElement<HTMLUListElement>("#expense-list").textContent).toContain(
      "0,10",
    );
    expect(getElement<HTMLUListElement>("#expense-list").textContent).toContain(
      "0,20",
    );
  });

  it("edits an existing expense and updates totals and form state", () => {
    getElement<HTMLInputElement>("#title").value = "Mercado";
    getElement<HTMLInputElement>("#amount").value = "25.50";
    getElement<HTMLSelectElement>("#category").value = "alimento";
    submitExpense();

    const editButton = getElement<HTMLButtonElement>(
      ".expense-item .edit-button",
    );
    editButton.click();

    getElement<HTMLInputElement>("#title").value = "Cinema";
    getElement<HTMLInputElement>("#amount").value = "40";
    getElement<HTMLSelectElement>("#category").value = "lazer";
    submitExpense();

    const list = getElement<HTMLUListElement>("#expense-list");
    expect(list.textContent).toContain("Cinema");
    expect(list.textContent).not.toContain("Mercado");
    expect(getElement<HTMLElement>("#total-value").textContent).toContain(
      "40,00",
    );
    expect(
      getElement<HTMLElement>('[data-category-total="lazer"]').textContent,
    ).toContain("40,00");
    expect(getElement<HTMLButtonElement>("#form-cancel").hidden).toBe(true);
  });

  it("deletes an expense after confirmation and keeps the summary consistent", () => {
    vi.stubGlobal("confirm", vi.fn(() => true));

    getElement<HTMLInputElement>("#title").value = "Mercado";
    getElement<HTMLInputElement>("#amount").value = "25.50";
    getElement<HTMLSelectElement>("#category").value = "alimento";
    submitExpense();

    getElement<HTMLInputElement>("#title").value = "Ônibus";
    getElement<HTMLInputElement>("#amount").value = "10";
    getElement<HTMLSelectElement>("#category").value = "transporte";
    submitExpense();

    const deleteButton = getElement<HTMLButtonElement>(
      ".expense-item .delete-button",
    );
    deleteButton.click();

    expect(getElement<HTMLUListElement>("#expense-list").children).toHaveLength(1);
    expect(getElement<HTMLElement>("#total-value").textContent).toContain(
      "10,00",
    );
    expect(
      getElement<HTMLElement>('[data-category-total="alimento"]').textContent,
    ).toContain("0,00");
    expect(
      getElement<HTMLElement>('[data-category-total="transporte"]').textContent,
    ).toContain("10,00");
  });
});
