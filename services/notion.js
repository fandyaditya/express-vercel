const secret = "secret_MsDd89lOAJuMKgFh00lzhv3aZ5sQFPTIWevI5JqkzCs";

const { Client } = require('@notionhq/client');

const notion = new Client({
    auth: secret
});

const getData = async (pageId) => {
    const formattedId = pageId.split('').map((char, index) => {
        if(index === 8 || index === 12 || index === 16 || index === 20) {
            return '-' + char;
        }
        return char;
    }).join('');
    const page = await notion.pages.retrieve({page_id: formattedId});
    const doctor = await notion.pages.properties.retrieve({page_id: formattedId, property_id: page.properties.Doctor.id});
    const nurse = await notion.pages.properties.retrieve({page_id: formattedId, property_id: page.properties.Nurse.id});

    const itemData = await getExamTreatments(page.properties.Examinations.relation[0].id);
    
    const returnVal = {
        invoiceNumber: page.properties['Invoice ID'].formula.string,
        invoiceDate: page.properties['Created time'].created_time,
        items: itemData,
        invoiceSum: itemData.reduce((a, {total}) => a+total, 0),
        doctor: doctor.formula.string,
        nurse: nurse.formula.string
    }
    // console.log(page.properties.doctor_f.rollup.array);
    // console.log(page.properties.nurse_f.rollup.array);

    return returnVal;
};

const getExamTreatments = async (examinationId) => {
    const dbId = "49c1892a-0006-4d2c-be25-b08b9a54e300";
    const filter = {
       property: 'Examination',
       relation: {
        contains: examinationId
       }
    }
    const data = await notion.databases.query({database_id: dbId, filter});
    const mappedItem = data.results.map((item) => {
        const itemData = item.properties;
        return { 
            itemName: itemData.treatment_name.formula.string,
            price: itemData.Price.rollup.number,
            discount: itemData.Discount.number,
            qty: itemData.Qty.number,
            total: itemData.Total.formula.number
        }
    });
    return mappedItem;
}

module.exports = {
    getData
}