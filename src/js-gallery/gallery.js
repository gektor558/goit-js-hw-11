import Notiflix from 'notiflix';
import { galleryTemplate } from "./template";
import { PixabayAPI } from './axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
  formEL: document.querySelector('#search-form'),
  galleryListEl: document.querySelector('.gallery'),
  loader: document.querySelector('.loader'),
}

const simple = new SimpleLightbox('.gallery a');
const pixabayApi = new PixabayAPI();
let endOfResultsShown = false;
let isScrollObserverActive = false;

refs.formEL.addEventListener('submit', onFormElSubmit);

const observerParams = {
  root: null,
  rootMargin: '0px 0px 600px 0px',
  threshold: 1.0,
}

const scrollObserver = new IntersectionObserver(onIntersectionObserverScroll, observerParams);

async function onFormElSubmit(event) {
  event.preventDefault();

  pixabayApi.q = event.target.elements.searchQuery.value.trim();
  pixabayApi.page = 1;
  endOfResultsShown = false;

  if (pixabayApi.q === '') {
    Notiflix.Notify.failure('Enter a word to search for');
    if (isScrollObserverActive) {
      scrollObserver.unobserve(refs.loader);
      isScrollObserverActive = false;
    }
    return;
  } else {
    if (!isScrollObserverActive) {
      scrollObserver.observe(refs.loader);
      isScrollObserverActive = true;
    }
  }

  try {
    const data = await pixabayApi.getGalleryCard();

    if (data.total === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      event.target.reset();
      refs.galleryListEl.innerHTML = '';
      if (isScrollObserverActive) {
        scrollObserver.unobserve(refs.loader);
        isScrollObserverActive = false;
      }
      return;
    }

    if (pixabayApi.page === 1) {
      refs.galleryListEl.innerHTML = galleryTemplate(data.hits);
      simple.refresh();
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      refs.loader.classList.remove('is-hidden');
      setTimeout(() => {
        if (!isScrollObserverActive) {
          scrollObserver.observe(refs.loader);
          isScrollObserverActive = true;
        }
      }, 250);
    }
  } catch (err) {
    console.log(`Error: ${err}`)
  }
}

async function onIntersectionObserverScroll(entries) {
  if (!entries[0].isIntersecting || endOfResultsShown) {
    return;
  }

  pixabayApi.page += 1;

  try {
    const data = await pixabayApi.getGalleryCard();
    console.log(pixabayApi.page);
    console.log(Math.floor(data.totalHits / pixabayApi.per_page));
    if (pixabayApi.page >= Math.ceil(data.totalHits / pixabayApi.per_page)) {
      endOfResultsShown = true;
      if (isScrollObserverActive) {
        scrollObserver.unobserve(refs.loader);
        isScrollObserverActive = false;
      }
      refs.loader.classList.add('is-hidden');
      Notiflix.Notify.info('Sorry, but you have reached the end of the search results');
      return;
    } else {
      refs.galleryListEl.insertAdjacentHTML('beforeend', galleryTemplate(data.hits));
      simple.refresh();
      const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
      });
    }
  } catch (err) {
    console.log(`Error: ${err}`)
  }
}



























