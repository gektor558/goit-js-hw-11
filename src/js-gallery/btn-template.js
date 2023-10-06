import Notiflix from 'notiflix';
import { galleryTemplate } from "./template";
import { PixabayAPI, axios } from './axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    formEL: document.querySelector('#search-form'),
    galleryListEl: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
    
}

const simple = new SimpleLightbox('.gallery a');
const pixabayApi = new PixabayAPI();

refs.formEL.addEventListener('submit', onFormElSubmit);
refs.loadMoreBtn.addEventListener('click', onloadMoreBtnClick);

async function onFormElSubmit(event) {
    event.preventDefault();

    pixabayApi.q = event.target.elements.searchQuery.value.trim();
    pixabayApi.page = 1;

    if (pixabayApi.q === '') {
        Notiflix.Notify.failure('Enter a word to search for');
        refs.loadMoreBtn.classList.add('is-hidden');
        return;
    } 

    try {
    
        const data = await pixabayApi.getGalleryCard();
        
    if (data.total === 0) {
         Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        refs.loadMoreBtn.classList.add('is-hidden');
        event.target.reset();

        refs.galleryListEl.innerHTML = '';
    
        return;
    }
        
    if (pixabayApi.page === 1) {
        refs.galleryListEl.innerHTML = galleryTemplate(data.hits);
        simple.refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`)       
        refs.loadMoreBtn.classList.remove('is-hidden');                  
    } 
    } catch (err) {
        console.log(`Error: ${err}`)
    }


}
 
 async function onloadMoreBtnClick(event) {
    pixabayApi.page += 1;
    try {
        const data = await pixabayApi.getGalleryCard();
        refs.galleryListEl.insertAdjacentHTML('beforeend', galleryTemplate(data.hits));
        simple.refresh();
        refs.loadMoreBtn.classList.remove('is-hidden');
        const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();

        window.scrollBy({
            top: cardHeight * 2,
            behavior: "smooth",
        });
        
        if (pixabayApi.page === Math.floor(data.totalHits / pixabayApi.per_page)) {
            refs.loadMoreBtn.classList.add('is-hidden');
            Notiflix.Notify.info('Sorry, but you have reached the end of the search results');
        }
    } catch (err) {
        console.log(`Error: ${err}`)
    }
}

