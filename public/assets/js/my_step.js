/**
 *  Page auth register multi-steps
 */

'use strict';

$(function () {
    var countiesData = [];

    // Initialize Select2
    $('.select2').each(function () {
        $(this).wrap('<div class="position-relative"></div>');
        $(this).select2({
            placeholder: 'Select',
            dropdownParent: $(this).parent()
        });
    });

    // Fetch counties.json data
    $.getJSON(assetsPath + 'json/counties.json', function (data) {
        countiesData = data; // Store data globally
        var $countySelect = $('#multiStepsState');

        $.each(data, function (index, county) {
            $countySelect.append($('<option>', {
                value: county.name,
                text: county.name
            }));
        });

        // Refresh Select2
        $countySelect.trigger('change');
    });

    // Event listener for County selection
    $('#multiStepsState').on('change', function () {
        var selectedCounty = $(this).val();
        var $subCountySelect = $('#multiStepsSubCounty');

        // Clear previous options
        $subCountySelect.empty().append('<option value="">Select</option>');

        // Find the selected county data
        var county = countiesData.find(c => c.name === selectedCounty);

        if (county) {
            $.each(county.sub_counties, function (index, subCounty) {
                $subCountySelect.append($('<option>', {
                    value: subCounty,
                    text: subCounty
                }));
            });
        }

        // Refresh Select2
        $subCountySelect.trigger('change');
    });
});
// Multi Steps Validation
// --------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function (e) {
    (function () {
        const stepsValidation = document.querySelector('#multiStepsValidation');
        if (typeof stepsValidation !== undefined && stepsValidation !== null) {
            // Multi Steps form
            const stepsValidationForm = stepsValidation.querySelector('#multiStepsForm');
            // Form steps
            const stepsValidationFormStep1 = stepsValidationForm.querySelector('#accountDetailsValidation');
            const stepsValidationFormStep2 = stepsValidationForm.querySelector('#personalInfoValidation');
            const stepsValidationFormStep3 = stepsValidationForm.querySelector('#billingLinksValidation');
            // Multi steps next prev button
            const stepsValidationNext = [].slice.call(stepsValidationForm.querySelectorAll('.btn-next'));
            const stepsValidationPrev = [].slice.call(stepsValidationForm.querySelectorAll('.btn-prev'));





            let validationStepper = new Stepper(stepsValidation, {
                linear: true
            });

            // Account details
            const multiSteps1 = FormValidation.formValidation(stepsValidationFormStep1, {
                fields: {
                    multiStepsUsername: {
                        validators: {
                            notEmpty: {
                                message: 'Please enter username'
                            },
                            stringLength: {
                                min: 6,
                                max: 30,
                                message: 'The name must be more than 6 and less than 30 characters long'
                            },
                            regexp: {
                                regexp: /^[a-zA-Z0-9 ]+$/,
                                message: 'The name can only consist of alphabetical, number and space'
                            }
                        }
                    },
                    multiStepsEmail: {
                        validators: {
                            notEmpty: {
                                message: 'Please enter email address'
                            },
                            emailAddress: {
                                message: 'The value is not a valid email address'
                            }
                        }
                    },
                    multiStepsPass: {
                        validators: {
                            notEmpty: {
                                message: 'Please enter password'
                            }
                        }
                    },

                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap5: new FormValidation.plugins.Bootstrap5({
                        // Use this for enabling/changing valid/invalid class
                        // eleInvalidClass: '',
                        eleValidClass: '',
                        rowSelector: '.col-sm-6'
                    }),
                    autoFocus: new FormValidation.plugins.AutoFocus(),
                    submitButton: new FormValidation.plugins.SubmitButton()
                },
                init: instance => {
                    instance.on('plugins.message.placed', function (e) {
                        if (e.element.parentElement.classList.contains('input-group')) {
                            e.element.parentElement.insertAdjacentElement('afterend', e.messageElement);
                        }
                    });
                }
            }).on('core.form.valid', function () {
                // Jump to the next step when all fields in the current step are valid
                validationStepper.next();
            });

            // Personal info
            const multiSteps2 = FormValidation.formValidation(stepsValidationFormStep2, {
                fields: {
                    multiStepsFirstName: {
                        validators: {
                            notEmpty: {
                                message: 'Please enter first name'
                            }
                        }
                    },
                    multiStepsAddress: {
                        validators: {
                            notEmpty: {
                                message: 'Please enter your address'
                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap5: new FormValidation.plugins.Bootstrap5({
                        // Use this for enabling/changing valid/invalid class
                        // eleInvalidClass: '',
                        eleValidClass: '',
                        rowSelector: function (field, ele) {
                            // field is the field name
                            // ele is the field element
                            switch (field) {
                                case 'multiStepsFirstName':
                                    return '.col-sm-6';
                                case 'multiStepsAddress':
                                    return '.col-sm-6';
                                default:
                                    return '.row';
                            }
                        }
                    }),
                    autoFocus: new FormValidation.plugins.AutoFocus(),
                    submitButton: new FormValidation.plugins.SubmitButton()
                }
            }).on('core.form.valid', function () {
                // Jump to the next step when all fields in the current step are valid
                validationStepper.next();
            });

            // Social links


            stepsValidationNext.forEach(item => {
                item.addEventListener('click', event => {
                    // When click the Next button, we will validate the current step
                    switch (validationStepper._currentIndex) {
                        case 0:
                            multiSteps1.validate();
                            break;

                        case 1:
                            multiSteps2.validate();
                            break;

                        case 2:
                            multiSteps3.validate();
                            break;

                        default:
                            break;
                    }
                });
            });

            stepsValidationPrev.forEach(item => {
                item.addEventListener('click', event => {
                    switch (validationStepper._currentIndex) {
                        case 2:
                            validationStepper.previous();
                            break;

                        case 1:
                            validationStepper.previous();
                            break;

                        case 0:

                        default:
                            break;
                    }
                });
            });
        }
    })();
});
function getLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById("latitude").value = position.coords.latitude;
                document.getElementById("longitude").value = position.coords.longitude;
                console.log(position)
            },
            (error) => {
                alert("Error getting location: " + error.message);
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}