export function galleryTemplate(photosArray) {

  const cardMarkup = photosArray.map(photoInfo => {
     
      return `<div class="photo-card">
      <a class="gallery_link" href="${photoInfo.largeImageURL}">
      <img src="${photoInfo.webformatURL}" alt="${photoInfo.tags}" loading="lazy" class="img"/>
       </a>
      <div class="info">
          <p class="info-item">
              <b>Likes</b>${photoInfo.likes}
          </p>
          <p class="info-item">
              <b>Views</b>${photoInfo.views}
          </p>
          <p class="info-item">
              <b>Comments</b>${photoInfo.comments}
          </p>
          <p class="info-item">
              <b>Downloads</b>${photoInfo.downloads}
          </p>
      </div>
  </div>`}).join('');
 
  return cardMarkup;

}