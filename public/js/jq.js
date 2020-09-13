const addSuccessMsg = document.getElementById("add_success_msg").value;
const addErrorMsg = document.getElementById("add_error_msg").value;
const editErrorMsg = document.getElementById("edit_error_msg").value;
const editSuccessMsg = document.getElementById("edit_success_msg").value;
const loginSuccess = document.getElementById("login_success").value;
const loginError = document.getElementById("login_error").value;
const signupError = document.getElementById("register_error").value;
const SignupSuccess = document.getElementById("register_success").value;
const logoutSuccess = document.getElementById("logout_success").value;
const deleteSuccessMsg = document.getElementById("delete_success_msg").value;


jQuery(document).ready(function ($) {

    // initials
    $('[data-toggle="tooltip"]').tooltip();
    // initials


    $('#send_product_form').find('#partnumber').on('input',function () {
        var input_txt = $(this).val();
        if (input_txt === ''){
            $(this).addClass('is-invalid');
            $(this).removeClass('is-valid');
            $(this).siblings('.error-feedback').css('display', 'block');
        }else {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
            $(this).siblings('.error-feedback').css('display', 'none');
        }
    });
    $('#send_product_form').find('#description').on('input',function () {
        var input_txt = $(this).val();
        if (input_txt === ''){
            $(this).addClass('is-invalid');
            $(this).removeClass('is-valid');
            $(this).siblings('.error-feedback').css('display', 'block');
        }else {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
            $(this).siblings('.error-feedback').css('display', 'none');
        }
    });


    let is_signup_email_valid = false;
    let is_signup_pass_valid = false;
    let is_signup_pass_repeat_valid = false;
    $('#signup_form').find('#your_email').on('input',function () {
        let input_txt = $(this).val();
        let emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        let is_email_valid = emailReg.test( input_txt );
        if (! is_email_valid || input_txt === ''){
            $(this).addClass('is-invalid');
            $(this).removeClass('is-valid');
            $(this).siblings('.error-feedback').css('display', 'block');
            is_signup_email_valid = false;
        }else {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
            $(this).siblings('.error-feedback').css('display', 'none');
            is_signup_email_valid = true;
        }
        if (is_signup_form_valid()){
            $('#signup_form').find('#btn_signup').removeAttr('disabled');
        }else {
            $('#signup_form').find('#btn_signup').attr('disabled' , 'disabled');
        }
    });
    $('#signup_form').find('#your_password').on('input',function () {
        let input_txt = $(this).val();
        if (input_txt === '' || input_txt.length < 6){
            $(this).addClass('is-invalid');
            $(this).removeClass('is-valid');
            $(this).siblings('.error-feedback').css('display', 'block');
            is_signup_pass_valid =false;
        }else {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
            $(this).siblings('.error-feedback').css('display', 'none');
            is_signup_pass_valid =true;
        }
        if (is_signup_form_valid()){
            $('#signup_form').find('#btn_signup').removeAttr('disabled');
        }else {
            $('#signup_form').find('#btn_signup').attr('disabled' , 'disabled');
        }

    });
    $('#signup_form').find('#your_password_repeat').on('input',function () {
        let pass_repeat = $(this).val();
        let pass = $('#your_password').val();
        if ( pass_repeat !== pass ){
            $(this).addClass('is-invalid');
            $(this).removeClass('is-valid');
            $(this).siblings('.error-feedback').css('display', 'block');
            is_signup_pass_repeat_valid =false;
        }else {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
            $(this).siblings('.error-feedback').css('display', 'none');
            is_signup_pass_repeat_valid =true;
        }
        if (is_signup_form_valid()){
            $('#signup_form').find('#btn_signup').removeAttr('disabled');
        }else {
            $('#signup_form').find('#btn_signup').attr('disabled' , 'disabled');
        }
    });
    function is_signup_form_valid(){
        if (is_signup_email_valid && is_signup_pass_valid && is_signup_pass_repeat_valid){
            return true;
        }
    }


    $('#add_spec_input').click(function (e) {
        e.preventDefault();
        $('.addAttrib').append('<div class="col-12 my-2"><div class="form-row"><div class="col-md-6 col-sm-12 mb-4"><label for="Attribute_name">عنوان ویژگی</label><input type="text" class="form-control" id="Attribute_name" name="attribNames" required></div><div class="col-md-6 col-sm-12 mb-4"><label for="Attribute_value">مقدار ویژگی</label><input type="text" class="form-control" id="Attribute_value" name="attribValues" required></div></div></div>');
    });

    $('#add_doc_input').click(function (e) {
        e.preventDefault();
        $('.addDocument').append('<div class="col-12 my-2"><div class="form-row"><div class="col-md-6 col-sm-12 mb-4"><label for="Doc_type">نوع سند </label><input type="text" class="form-control docType" id="Doc_type" name="docType" required></div><div class="col-md-6 col-sm-12 mb-4"><label for="Doc_name">نام سند </label><input type="text" class="form-control" id="Doc_name" name="docName" required></div><div class="file-field col-12"><div class="btn btn-md purple-gradient btn-sm float-left"><span><i class="material-icons">attach_file</i></span><input type="file" id="Doc_url" name="docUrl" accept="application/pdf"></div><div class="file-path-wrapper"><input class="file-path validate" type="text" placeholder="آپلود فایل" ></div></div></div></div>');
    });

    $('#add_image_input').click(function (e) {
        e.preventDefault();
        $('.addImage').append('<div class="col-12 my-2"> <div class="file-field col-12"><div class="btn purple-gradient btn-sm float-left"><span><i class="material-icons">image</i></span><input type="file" name="part_image" accept="image/*"></div><div class="file-path-wrapper"><input class="file-path validate" type="text" placeholder="آپلود تصویر"></div></div></div>');
    });


    $('button[type=submit]').click(function () {
        $(this).find('i').addClass('spin').css('display', 'inline-block');
    });

    $('#loginTabClick').on('click' , function (e) {
        e.preventDefault();
        $('#loginTab').click();
    });
    $('#registerTabClick').on('click' , function (e) {
        e.preventDefault();
        $('#registerTab').click();
    });

    $('#pass_reveal').on('click' , function () {
        let status = $(this).html();
        if (status === 'visibility_off') {
            $('#signup_form').find('#your_password').attr('type', 'text');
            $(this).html('visibility');
        }else {
            $('#signup_form').find('#your_password').attr('type', 'password');
            $(this).html('visibility_off');
        }
    });
    $('#pass_repeat_reveal').on('click' , function () {
        let status = $(this).html();
        if (status === 'visibility_off') {
            $('#signup_form').find('#your_password_repeat').attr('type', 'text');
            $(this).html('visibility');
        }else {
            $('#signup_form').find('#your_password_repeat').attr('type', 'password');
            $(this).html('visibility_off');
        }
    });


    $('.del_modal_trigger').click(function () {
        let imageSrc = $(this).data('src');
        let new_href = '/image/remove/' + imageSrc;
        $('#del_modal_submit_btn').attr('href' , new_href);
    });


    $('.delete_product').click(function (e) {
        e.preventDefault();
        let product_id = $(this).data('id');
        let product_number = $(this).data('pnumber');

        if (confirm('از حذف این محصول اطمینان دارید؟')){
            $.ajax({
                url: '/delete_product',
                type: 'POST',
                data: { 'product_id':product_id ,'product_number':product_number  },
                dataType: 'JSON',
                success: function (data) {
                    if (data['msg'] === 1){
                        window.location.reload();
                    } else {
                        alert(data['msg']);
                    }
                }, error:function (err) {
                    console.log(err);
                }
            });
        }

    });


    $('.removeImage').click(function () {
        let thisElement = $(this);
        if (confirm('از حذف این آیتم اطمینان دارید؟')){
            let img_src = $(this).data('src');
            let img_id = $(this).data('srcid');
            //console.log('rtertre: ' + img_id);

            let res = img_src.split("/");
            $.ajax({
                url: '/remove_image',
                type: 'POST',
                data: {'img_name':res[5],'img_id':img_id},
                dataType: 'JSON',
                success: function (data) {
                    if (data['msg'] === 1){
                        //alert('deleted');
                        thisElement.parent().remove();
                    } else {
                        alert(data['msg']);
                    }
                }, error:function (err) {
                    console.log(err);
                }
            });
        }
    });
    $('.removeDoc').click(function () {
        let thisElement = $(this);
        if (confirm('از حذف این آیتم اطمینان دارید؟')){
            let doc_src = $(this).data('src');
            let res = doc_src.split("/");
            $.ajax({
                url: '/remove_document',
                type: 'POST',
                data: { 'doc_name':res[5] },
                dataType: 'JSON',
                success: function (data) {
                    if (data['msg'] === 1){
                        thisElement.parent('.form-row').remove();
                    } else {
                        alert(data['msg']);
                    }
                }, error:function (err) {
                    console.log(err);
                }
            });
        }
    });


    $('#search_query_input').on('input' ,function () {
        let ser_query = $(this).val();
        $('#search_products').attr('action' , '/dashboard/products/search/' + ser_query);
    })


});
