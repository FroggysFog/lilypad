function readURL(input, imgControlName) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.querySelectorAll(imgControlName).forEach(img => img.setAttribute('src', e.target.result));
    };
    reader.readAsDataURL(input.files[0]);
  }
}

document.querySelectorAll('.input-img').forEach(input => {
  input.addEventListener('change', function () {
    const imgControlName = '.preview1';
    readURL(this, imgControlName);
    const uploadWrap = this.closest('.profile-upload');
    if (uploadWrap) {
      const preview = uploadWrap.querySelector('.preview1');
      if (preview) preview.classList.add('it');
      const removeBtn = uploadWrap.querySelector('.profile-remove');
      if (removeBtn) removeBtn.classList.add('profile-remove-btn');
    }
  });
});

document.querySelectorAll('.profile-remove').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const uploadWrap = this.closest('.profile-upload');
    if (!uploadWrap) return;
    const inputImg = uploadWrap.querySelector('.input-img');
    if (inputImg) inputImg.value = '';
    const preview = uploadWrap.querySelector('.preview1');
    if (preview) {
      preview.setAttribute('src', '');
      preview.classList.remove('it');
    }
    const removeBtn = uploadWrap.querySelector('.profile-remove');
    if (removeBtn) removeBtn.classList.remove('profile-remove-btn');
  });
});
