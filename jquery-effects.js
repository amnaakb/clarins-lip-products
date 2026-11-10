// Three jQuery effects: product fade, expandable reviews, and smooth scrolling.
// .stop(true,true) prevents queued animations on repeated clicks.
$(function () {
  // Effect 1: fade in shop cards when the page renders or currency changes.
  function revealProducts() {
    const $cards = $('#product-list .product-card');
    if (!$cards.length) return;
    $cards.stop(true, true).css('opacity', 0).animate({ opacity: 1 }, 350);
  }
  revealProducts();
  document.addEventListener('settingschange', function () {
    // products.js re-renders synchronously before this handler (loaded first).
    revealProducts();
  });

  // Effect 2: toggle customer reviews with slideToggle.
  const $reviewSections = $('.reviews');
  $reviewSections.each(function (i) {
    const $section = $(this);
    const id = 'review-content-' + i;
    const $heading = $section.find('h2').first();
    if (!$heading.length) return;
    const $content = $heading.nextAll().wrapAll('<div id="' + id + '"></div>').parent();
    if (!$content.length) return;
    $('<button type="button" class="review-toggle" aria-expanded="true" aria-controls="' + id + '">Hide reviews</button>')
      .insertAfter($heading).on('click', function () {
        const $button = $(this);
        const opening = $button.attr('aria-expanded') !== 'true';
        $content.stop(true, true).slideToggle(250);
        $button.attr('aria-expanded', String(opening));
        $button.text(opening ? 'Hide reviews' : 'Show reviews');
      });
  });

  // Effect 3: smooth-scroll from the shop shortcut to its product list.
  $('.shop').each(function () {
    const $shop = $(this);
    const shopId = 'shop-shades';
    $shop.attr('id', shopId);
    const $link = $('<a class="shop-jump" href="#' + shopId + '">Browse shades ↓</a>');
    $('main .intro').first().append($link);
  });
  $(document).on('click', 'a.shop-jump', function (event) {
    const target = document.getElementById(this.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.scrollIntoView();
    } else {
      $('html, body').stop(true).animate({ scrollTop: $(target).offset().top - 15 }, 450);
    }
  });
});
