$(".block-window-scroll").bind("mousewheel DOMMouseScroll", function (e) {
    var e0 = e.originalEvent,
    delta = e0.wheelDelta || -e0.detail;
    
    this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
    e.preventDefault();
});

setTimeout(function() {
    document.getElementById('warning').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  }, 3000);

  var countdown = 3;
  var countdownElement = document.getElementById('countdown');

  var countdownInterval = setInterval(function() {
    countdown--;
    countdownElement.textContent = countdown;
    if (countdown === 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);