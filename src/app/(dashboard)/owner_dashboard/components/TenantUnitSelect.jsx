"use client";

import { useEffect, useRef } from "react";

export default function TenantUnitSelect({ 
  units, 
  value, 
  onChange, 
  required = false,
  placeholder = "Select a unit",
  id = "unit-select"
}) {
  const selectRef = useRef(null);
  const select2Instance = useRef(null);

  useEffect(() => {
    // Load Select2 CSS and JS dynamically
    const loadSelect2 = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="select2.css"]')) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = '/assets/vendor/libs/select2/select2.css';
        document.head.appendChild(css);
      }

      // Load JS
      if (!window.jQuery) {
        // Load jQuery first if not available
        const jquery = document.createElement('script');
        jquery.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        document.head.appendChild(jquery);
        
        await new Promise(resolve => {
          jquery.onload = resolve;
        });
      }

      if (!window.jQuery.fn.select2) {
        const select2Script = document.createElement('script');
        select2Script.src = '/assets/vendor/libs/select2/select2.js';
        document.head.appendChild(select2Script);
        
        await new Promise(resolve => {
          select2Script.onload = resolve;
        });
      }

      // Initialize Select2
      initializeSelect2();
    };

    loadSelect2();

    return () => {
      // Cleanup Select2 instance
      if (select2Instance.current) {
        window.jQuery(selectRef.current).select2('destroy');
      }
    };
  }, []);

  useEffect(() => {
    // Update Select2 when units change
    if (select2Instance.current) {
      window.jQuery(selectRef.current).trigger('change.select2');
    }
  }, [units]);

  useEffect(() => {
    // Update selected value
    if (select2Instance.current && value) {
      window.jQuery(selectRef.current).val(value).trigger('change.select2');
    }
  }, [value]);

  const initializeSelect2 = () => {
    if (window.jQuery && window.jQuery.fn.select2 && selectRef.current) {
      const $select = window.jQuery(selectRef.current);
      
      $select.select2({
        placeholder: placeholder,
        allowClear: !required,
        width: '100%',
        templateResult: formatOption,
        templateSelection: formatSelection,
        escapeMarkup: function(markup) { return markup; }
      });

      // Handle change events
      $select.on('select2:select', function(e) {
        const selectedValue = e.params.data.id;
        if (onChange) {
          onChange({
            target: {
              name: selectRef.current.name,
              value: selectedValue
            }
          });
        }
      });

      $select.on('select2:clear', function() {
        if (onChange) {
          onChange({
            target: {
              name: selectRef.current.name,
              value: ''
            }
          });
        }
      });

      select2Instance.current = $select;
    }
  };

  const formatOption = (option) => {
    if (!option.id) return option.text;
    
    const unit = units.find(u => u.id.toString() === option.id.toString());
    if (!unit) return option.text;

    return `
      <div class="select2-unit-option">
        <div class="unit-name"><strong>${unit.name}</strong></div>
        <div class="unit-details">
          <small class="text-muted">
            ${unit.building_name} • Ksh ${unit.rent_amount_kes?.toLocaleString() || 'N/A'}
            ${unit.is_occupied ? '<span class="badge badge-danger ml-2">Occupied</span>' : '<span class="badge badge-success ml-2">Available</span>'}
          </small>
        </div>
      </div>
    `;
  };

  const formatSelection = (option) => {
    if (!option.id) return option.text;
    
    const unit = units.find(u => u.id.toString() === option.id.toString());
    if (!unit) return option.text;

    return `${unit.name} - ${unit.building_name}`;
  };

  return (
    <>
      <select
        ref={selectRef}
        className="form-control"
        id={id}
        name="unit"
        required={required}
        defaultValue={value || ""}
      >
        <option value="">{placeholder}</option>
        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.name} - {unit.building_name} ({unit.is_occupied ? 'Occupied' : 'Available'})
          </option>
        ))}
      </select>
      
      <style jsx>{`
        .select2-unit-option {
          padding: 5px 0;
        }
        .unit-name {
          margin-bottom: 2px;
        }
        .unit-details {
          margin-left: 0;
        }
        .select2-container {
          width: 100% !important;
        }
        .select2-selection--single {
          height: 38px !important;
          border: 1px solid #ced4da !important;
          border-radius: 0.25rem !important;
        }
        .select2-selection__rendered {
          line-height: 36px !important;
          padding-left: 12px !important;
        }
        .select2-selection__arrow {
          height: 36px !important;
        }
      `}</style>
    </>
  );
}