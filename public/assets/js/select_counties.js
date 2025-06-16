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
        var $countySelect = $('#counties');

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
    $('#counties').on('change', function () {
        var selectedCounty = $(this).val();
        var $subCountySelect = $('#subcounty');

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