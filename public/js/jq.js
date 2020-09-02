const addSuccessMsg = document.getElementById("add_success_msg").value;
const addErrorMsg = document.getElementById("add_error_msg").value;
const loginSuccess = document.getElementById("login_success").value;
const loginError = document.getElementById("login_error").value;
const signupError = document.getElementById("register_error").value;
const SignupSuccess = document.getElementById("register_success").value;


jQuery(document).ready(function ($) {
    // initials //
    $('[data-toggle="tooltip"]').tooltip();
    // initials //

    $('#partnumber').on('input',function () {
        var input_txt = $(this).val();
        if (input_txt == ''){
            $(this).addClass('is-invalid');
            $(this).removeClass('is-valid');
            $(this).siblings('.error-feedback').css('display', 'block');
        }else {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
            $(this).siblings('.error-feedback').css('display', 'none');
        }
    });
    $('#description').on('input',function () {
        var input_txt = $(this).val();
        if (input_txt == ''){
            $(this).addClass('is-invalid');
            $(this).removeClass('is-valid');
            $(this).siblings('.error-feedback').css('display', 'block');
        }else {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
            $(this).siblings('.error-feedback').css('display', 'none');
        }
    });


    $('#add_spec_input').click(function (e) {
        e.preventDefault();
        $('.addAttrib').append('<div class="col-12 my-2"><div class="form-row"><div class="col-md-6 col-sm-12 mb-4"><label for="Attribute_name">عنوان ویژگی</label><input type="text" class="form-control" id="Attribute_name" name="attribNames" required></div><div class="col-md-6 col-sm-12 mb-4"><label for="Attribute_value">مقدار ویژگی</label><input type="text" class="form-control" id="Attribute_value" name="attribValues" required></div></div></div>');
    });

    $('#add_doc_input').click(function (e) {
        e.preventDefault();
        $('.addDocument').append('<div class="col-12 my-2"><div class="form-row"><div class="col-md-6 col-sm-12 mb-4"><label for="Doc_type">نوع سند </label><input type="text" class="form-control docType" id="Doc_type" name="docType" required></div><div class="col-md-6 col-sm-12 mb-4"><label for="Doc_name">نام سند </label><input type="text" class="form-control" id="Doc_name" name="docName" required></div><div class="form-row file-field col-12"><div class="file-path-wrapper"><input class="file-path validate" type="text" placeholder="آپلود فایل"></div><a class="btn-floating btn-md purple-gradient mt-0 float-left"><i class="material-icons">cloud_upload</i><input type="file" id="Doc_url" name="docUrl" accept="application/pdf"></a></div></div></div>');
    });

    $('#add_image_input').click(function (e) {
        e.preventDefault();
        $('.addImage').append('<div class="col-12 my-2"><div class="form-row file-field"><div class="file-path-wrapper"><input class="file-path validate" type="text" placeholder="آپلود تصویر"></div><a class="btn-floating btn-md purple-gradient mt-0 float-left"><i class="material-icons">cloud_upload</i><input type="file" id="Image" name="part_image" accept="image/*"></a></div></div>');
    });


    $('button[type=submit]').click(function () {
        $(this).find('i').addClass('spin').css('display', 'inline-block');
    })
});


