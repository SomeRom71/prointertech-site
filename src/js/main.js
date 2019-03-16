const $ = require('../../node_modules/jquery/dist/jquery');
global.jQuery = global.$ = $;
require('@fancyapps/fancybox');
var Swiper = require('../../node_modules/swiper/dist/js/swiper');

$(document).on('click','.dropdown-btn',function(){
	$('.dropdown').toggleClass('active');
	return false;
});

$(document).on('click','li.has-sub >a',function(){
	$(this).parent().toggleClass('active');
	return false;
});

$(document).on('click','.catalog__mobile',function(){
	$('.catalog__container').toggleClass('mob_active');
	return false;
});

$(document).on('click','.filter__mobile',function(){
	$('.filter__mobile').toggleClass('mob_active');
	return false;
});

$(document).on('click','ul#product-accordion-tabs.tabs > li > a',function(){
	$('.is-active').removeClass('is-active');
	$(this).parent().addClass('is-active');
	console.log($(this).attr('href'));
	$('li'+$(this).attr('href')).addClass('is-active');

	return false;
});

$('[data-fancybox="group"]').fancybox();

// eslint-disable-next-line
var mySwiper = new Swiper ('.swiper-container', {
	autoplay: {
		delay: 5000,
	},
	direction: 'horizontal',
	slidesPerView: 3,
	centeredSlides: true,
	loop: true,
	loopAdditionalSlides: 100,
	initialSlide: 1,
	navigation: {
		nextEl: '.fa-angle-right',
		prevEl: '.fa-angle-left',
	},
	breakpoints: {
		998: {
			slidesPerView: 1,
			spaceBetween: 10
		},
		1280: {
			slidesPerView: 2,
			centeredSlides: false,
			spaceBetween: 20
		}
	}
});

// eslint-disable-next-line
var mySwipe = new Swiper ('.swiper__main', {
	autoplay: {
		delay: 5000,
	},
	direction: 'horizontal',
	slidesPerView: 1,
	centeredSlides: true,
	loop: true,
	loopAdditionalSlides: 100,
	navigation: {
		nextEl: '.fa-angle-right',
		prevEl: '.fa-angle-left',
	}
});

// eslint-disable-next-line
ymaps.ready(function(){
	// eslint-disable-next-line
	var myMap = new ymaps.Map('YMapsID', {
			center: [55.812008, 49.184621],
			zoom: 17,
			controls: ['zoomControl']
		}),
		// eslint-disable-next-line
		myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
			hintContent: 'Казань, улица Академика Кирпичникова, 21/14',
			balloonContent: ''
		}, {
			iconLayout: 'default#image',
			iconImageHref: 'img/map-point.png',
			iconImageSize: [130, 70],
			iconImageOffset: [-70, -85]
		});
	myMap.geoObjects.add(myPlacemark);
	myMap.behaviors.disable('scrollZoom');
});
