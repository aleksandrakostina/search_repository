const debounceTime = 200;
const autocompList = document.querySelector(".dropdown__list");
const inputSearch = document.querySelector(".form-search__input");
const repList = document.querySelector(".repositories__list");
const resultText = document.querySelector(".info__text");

const getRepositories = (query) => {
  const url = `https://api.github.com/search/repositories?q=${query}`;

  return fetch(url).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response.json());
  });
};

const debounce = (fn, ms) => {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), ms);
  };
};

const clearAutocompleteList = () => {
  autocompList.innerHTML = "";
};

const searchRepositories = (e) => {
  if (e.target.value) {
    getRepositories(e.target.value)
      .then((data) => {
        renderAutocompleteList(data.items);
      })
      .catch((err) => {
        resultText.textContent = "Что-то пошло не так :(";
        clearAutocompleteList();
      });
  } else {
    clearAutocompleteList();
  }
};

const getRepositoriesWithDebounce = debounce(searchRepositories, debounceTime);

const createRepositoryItem = (repository) => {
  const rep = document.createElement("li");
  rep.classList.add("repositories__item");

  const repDescription = document.createElement("div");
  repDescription.classList.add("repositories__description");

  const repName = document.createElement("p");
  repName.classList.add("repositories__text");
  repName.textContent = `Name: ${repository.name}`;

  const repOwner = document.createElement("p");
  repOwner.classList.add("repositories__text");
  repOwner.textContent = `Owner: ${repository.owner}`;

  const repStar = document.createElement("p");
  repStar.classList.add("repositories__text");
  repStar.textContent = `Stars: ${repository.stars}`;

  repDescription.append(repName, repOwner, repStar);

  const btn = document.createElement("button");
  btn.classList.add("repositories__btn");

  rep.append(repDescription, btn);

  return rep;
};

const addRepositoryToList = (e) => {
  if (e.target.closest(".dropdown__btn")) {
    inputSearch.value = "";
    clearAutocompleteList();
    const repository = e.target.closest(".dropdown__item").dataset;
    repList.prepend(createRepositoryItem(repository));
  }
};

const createAutocompleteItem = (repository) => {
  const item = document.createElement("li");
  item.classList.add("dropdown__item");

  const btn = document.createElement("button");
  btn.classList.add("dropdown__btn");
  btn.textContent = repository.name;

  item.append(btn);

  item.dataset.name = repository.name ?? "-";
  item.dataset.owner = repository.owner.login ?? "-";
  item.dataset.stars = repository.stargazers_count ?? "-";

  return item;
};

const renderAutocompleteList = (data) => {
  clearAutocompleteList();
  resultText.textContent = "";

  if (!data.length) {
    resultText.textContent = "По вашему запросу ничего не найдено";
  } else {
    const fragment = document.createDocumentFragment();
    data.slice(0, 5).forEach((repository) => {
      fragment.append(createAutocompleteItem(repository));
    });
    autocompList.append(fragment);
  }
};

const removeRepository = (e) => {
  if (e.target.closest(".repositories__btn")) {
    e.target.closest(".repositories__item").remove();
  }
};

const removeAutocompleteList = () => {
  autocompList.classList.add("dropdown__list--hidden");
};

const addAutocompleteList = () => {
  autocompList.classList.remove("dropdown__list--hidden");
};

document.addEventListener("DOMContentLoaded", () => {
  inputSearch.addEventListener("keyup", getRepositoriesWithDebounce);
  inputSearch.addEventListener("focus", addAutocompleteList);
  inputSearch.addEventListener("blur", removeAutocompleteList);

  autocompList.addEventListener("mousedown", (e) => e.preventDefault());
  autocompList.addEventListener("click", addRepositoryToList);

  repList.addEventListener("click", removeRepository);
});
