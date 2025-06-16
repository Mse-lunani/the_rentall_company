/**
 * Account Settings - Account
 */

'use strict';

document.addEventListener('DOMContentLoaded', function (e) {
    (function () {
        const formAccSettings = document.querySelector('#formAccountSettings');



        // Form validation for Add new record
        if (formAccSettings) {
            const fv = FormValidation.formValidation(formAccSettings, {
                fields: {
                    firstName: {
                        validators: {
                            notEmpty: {
                                message: 'Please enter first name'
                            }
                        }
                    },

                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap5: new FormValidation.plugins.Bootstrap5({
                        eleValidClass: '',
                        rowSelector: '.col-md-12'
                    }),
                    submitButton: new FormValidation.plugins.SubmitButton(),
                    autoFocus: new FormValidation.plugins.AutoFocus()
                },
                init: instance => {
                    instance.on('plugins.message.placed', function (e) {
                        if (e.element.parentElement.classList.contains('input-group')) {
                            e.element.parentElement.insertAdjacentElement('afterend', e.messageElement);
                        }
                    });
                }
            });
        }


        // Update/reset user image of account page
        let accountUserImage = document.getElementById('uploadedAvatar');
        const fileInput = document.querySelector('.account-file-input'),
            resetFileInput = document.querySelector('.account-image-reset'),
            errorMessage = document.getElementById('error');

        if (accountUserImage) {
            const resetImage = accountUserImage.src;

            fileInput.onchange = () => {
                const file = fileInput.files[0];

                if (file) {
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                    const maxSize = 1024 * 1024; // 1024KB

                    if (!allowedTypes.includes(file.type)) {
                        errorMessage.textContent = 'Only JPG, JPEG, or PNG files are allowed.';
                        fileInput.value = '';
                        return;
                    }

                    if (file.size > maxSize) {
                        errorMessage.textContent = 'File size must be less than 1024KB.';
                        fileInput.value = '';
                        return;
                    }

                    errorMessage.textContent = '';
                    accountUserImage.src = URL.createObjectURL(file);
                }
            };

            resetFileInput.onclick = () => {
                fileInput.value = '';
                accountUserImage.src = resetImage;
                errorMessage.textContent = '';
            };
        }

    })();
});

// Select2 (jquery)
$(function () {
    var select2 = $('.select2');
    // For all Select2
    if (select2.length) {
        select2.each(function () {
            var $this = $(this);
            $this.wrap('<div class="position-relative"></div>');
            $this.select2({
                dropdownParent: $this.parent()
            });
        });
    }
});
