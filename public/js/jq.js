jQuery(document).ready(function ($) {

    $('#add_spec_input').click(function (e) {
        e.preventDefault();
        let name_el = $('.addAttrib').find('input#Attribute_name').last();
        let nameStr = name_el[0]['name'];
        let nameStrIndex = nameStr.substr(11,1);
        nameStrIndex++;
        let value_el = $('.addAttrib').find('input#Attribute_value').last();
        let valueStr = value_el[0]['name'];
        let valueStrIndex = valueStr.substr(12,1);
        valueStrIndex++;
        $('.addAttrib').append('<div class="col-6 mb-4"><label for="Attribute_name">عنوان ویژگی </label><input type="text" class="form-control" id="Attribute_name" name="attribNames" required></div><div class="col-6 mb-4"><label for="Attribute_value">مقدار ویژگی </label><input type="text" class="form-control" id="Attribute_value" name="attribValues" required></div>');
    });

    $('#add_doc_input').click(function (e) {
        e.preventDefault();
        let type_el = $('.addDocument').find('input#Doc_type').last();
        let typeStr = type_el[0]['name'];
        let typeStrIndex = typeStr.substr(8,1);
        typeStrIndex++;
        let name_el = $('.addDocument').find('input#Doc_name').last();
        let nameStr = name_el[0]['name'];
        let nameStrIndex = nameStr.substr(8,1);
        nameStrIndex++;
        let url_el = $('.addDocument').find('input#Doc_url').last();
        let urlStr = url_el[0]['name'];
        let urlStrIndex = urlStr.substr(7,1);
        urlStrIndex++;
        $('.addDocument').append('<div class="col-md-4 col-sm-12 mb-4"><label for="Doc_type">نوع سند </label><input type="text" class="form-control docType" id="Doc_type" name="docType" required></div><div class="col-md-4 col-sm-12 mb-4"><label for="Doc_name">نام سند </label><input type="text" class="form-control" id="Doc_name" name="docName" required></div><div class="col-md-4 col-sm-12 mb-4"><label for="Doc_url">فایل سند </label><input type="file" class="form-control" id="Doc_url" name="docUrl" required accept="application/pdf"></div>');
    });

    $('#add_image_input').click(function (e) {
        e.preventDefault();
        let name_el = $('.addImage').find('input#Image').last();
        let nameStr = name_el[0]['name'];
        let nameStrIndex = nameStr.substr(11,1);
        nameStrIndex++;
        $('.addImage').append('<div class="col-12 mb-4"><label for="Image">تصویر </label><input type="file" class="form-control images" id="Image" name="part_image" accept="image/*"></div>');
    });

});
