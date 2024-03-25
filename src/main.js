import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

const refs = {
  form: document.querySelector('.form'),
  gallery: document.querySelector('.gallery'),
  loader: document.querySelector('.loader'),
  loadMoreButton: document.querySelector('.load-more-button'),
};

let query = '';
let currentPage = 1;
let total = 0;
const PER_PAGE = 15;

async function getImages() {
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '42624309-2f383790b25e3b1bacdf1d6d0';
  const url = `${BASE_URL}?key=${API_KEY}`;
  try {
    const { data } = await axios.get(url, {
      params: {
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        q: query,
        per_page: PER_PAGE,
        page: currentPage,
      },
    });
    return data;
  } catch (error) {
    console.error("Сталася помилка при отриманні зображень:", error.message);
  }
}

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreButton.addEventListener('click', loadMore);

async function onFormSubmit(event) {
  event.preventDefault();
  refs.loadMoreButton.classList.add('hidden');
  if (query === event.target.elements.query.value.trim()) {
    event.target.reset();
    toggleLoadMoreButton();
    return;
  } else {
    query = event.target.elements.query.value.trim();
  }
  currentPage = 1;
  refs.gallery.textContent = '';
  toggleLoader();

  try {
    const data = await getImages();
    if (!query) {
      iziToast.warning({
        message: 'Sorry, you forgot to enter a search term. Please try again!',
        position: 'topRight',
        messageSize: '16px',
        timeout: 2000,
      });
      toggleLoader();
      return;
    } else if (parseInt(data.totalHits) > 0) {
      toggleLoadMoreButton();
      renderMarkup(data.hits);
      total = data.totalHits;
      checkButtonStatus();
      toggleLoader();
    } else {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
        backgroundColor: 'red',
        messageColor: 'white',
        messageSize: '16px',
        iconColor: 'white',
        iconUrl: errorIcon,
        color: 'white',
        timeout: 2000,
      });
      toggleLoader();
    }
  } catch (error) {
    iziToast.error({
      message: 'Error',
      position: 'topRight',
      backgroundColor: 'red',
      messageColor: 'white',
      messageSize: '16px',
      iconColor: 'white',
      iconUrl: errorIcon,
      color: 'white',
      timeout: 2000,
    });
    toggleLoader();
  }
  event.target.reset();
}

function galleryTemplate({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<a class='gallery-link' href='${largeImageURL}'><img class='gallery-image' src='${webformatURL}' alt='${tags}'/>
  <div class='gallery-review'>
  <div class='gallery-review-item'><b>Likes</b> <span>${likes}</span></div>
  <div class='gallery-review-item'><b>Views</b> <span>${views}</span></div>
  <div class='gallery-review-item'><b>Comments</b> <span>${comments}</span></div>
  <div class='gallery-review-item'><b>Downloads</b> <span>${downloads}</span></div>
  </div></a>
    `;
}

let gallery = new SimpleLightbox('.gallery a', {
  showCounter: false,
  captionDelay: 250,
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
});

function renderMarkup(images) {
  const markup = images.map(galleryTemplate).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  gallery.refresh();
}

async function loadMore() {
  toggleLoader();
  toggleLoadMoreButton();
  currentPage += 1;
  const data = await getImages();
  renderMarkup(data.hits);
  toggleLoadMoreButton();
  checkButtonStatus();
  toggleLoader();
  scrollByGalleryCardHeight();
}

function checkButtonStatus() {
  const maxPage = Math.ceil(total / PER_PAGE);
  const isLastPage = maxPage <= currentPage;
  if (isLastPage) {
    refs.loadMoreButton.classList.add('hidden');
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight',
      messageSize: '16px',
      timeout: 2000,
    });
  }
}

function toggleLoader() {
  refs.loader.classList.toggle('hidden');
}

function toggleLoadMoreButton() {
  refs.loadMoreButton.classList.toggle('hidden');
}

function scrollByGalleryCardHeight() {
  const galleryCard = document.querySelector('.gallery-link');
  if (galleryCard) {
    const cardRect = galleryCard.getBoundingClientRect();
    const cardHeight = cardRect.height;
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } else {
    return;
  }
}
