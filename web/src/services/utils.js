import api from "./api";

function encodeQuery(data) {
    let query = "?";

    for (let d in data) {
        query += encodeURIComponent(d) + '=' + 
        encodeURIComponent(data[d]) + '&'

    }

    return query.slice(0, -1)
}

const reverseString = (str) => {
    let newString = "";
 
    for (let i = str.length - 1; i >= 0; i--) { 
        newString += str[i]; 
    }

    return newString;
}

const maskAmount = value => {
    let maskedPrice = reverseString(value.toString().replace(/[^\d]+/gi, ""));
    const mask = reverseString("###.###.###.###.###,##");
    let result = "";

    for (var x = 0, y = 0; x < mask.length && y < maskedPrice.length;) {
        if (mask.charAt(x) != "#") {
            result += mask.charAt(x);
            x++;
        } else {
            result += maskedPrice.charAt(y);
            y++;
            x++;
        }
    }

    result = reverseString(result);
    const amount = parseFloat(result.replace(".", "").replace(",", "."));

    return {
        amount,
        maskedAmount: `R$ ${result}`
    }
}

const submitFile = async (file, filename) => {
    const formData = new FormData();

    formData.append('name', filename);
    formData.append('file', file);

    const response = await api.post('/files', formData);
    return response.data.path;
  }

const uuidv4 = () => {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  }

export {
    encodeQuery,
    reverseString,
    maskAmount,
    submitFile,
    uuidv4,
}
