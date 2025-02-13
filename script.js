// Mahsulotlar ro'yxati (bar kodga mos nom va narx)
const products = {
  "1234567890": { name: "Mahsulot 1", price: 10000 },
  "0987654321": { name: "Mahsulot 2", price: 15000 },
  "1122334455": { name: "Mahsulot 3", price: 20000 }
};

// Kamera va barcode skanerlashni ishga tushurish
function startScanner() {
  // Barcha kameralarni olish
  navigator.mediaDevices.enumerateDevices().then(devices => {
    // Faqat video inputlarni tanlash (kameralar)
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    // Orqa kamerani tanlash
    const backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back') || device.facing === 'environment');

    if (backCamera) {
      // Orqa kameraga ruxsat so'rash
      navigator.mediaDevices.getUserMedia({
        video: { deviceId: backCamera.deviceId }
      }).then((stream) => {
        const video = document.getElementById("video");
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // iPhone uchun kerak
        video.play();

        // QuaggaJS ni ishga tushurish
        Quagga.init({
          inputStream: {
            type: "LiveStream",
            target: video, // video element
            constraints: {
              facingMode: "environment" // Orqa kamera uchun
            }
          },
          decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_13_reader", "upc_reader"]
          },
          frequency: 10, // Har sekundda 10 marta skanerlash
        }, function(err) {
          if (err) {
            console.error("QuaggaJS xatolik: ", err);
            return;
          }
          Quagga.start();
        });

        // Barcode topilganda
        Quagga.onDetected(function(result) {
          const barcode = result.codeResult.code;
          fetchProductData(barcode);
        });
      }).catch(function(err) {
        alert("Kamera ochishda xatolik yuz berdi: " + err);
      });
    } else {
      alert("Orqa kamera topilmadi.");
    }
  }).catch(function(err) {
    alert("Kameralar ro'yxatini olishda xatolik yuz berdi: " + err);
  });
}

// Mahsulotni ma'lumotlar bazasidan olish
function fetchProductData(barcode) {
  const product = products[barcode];

  if (product) {
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productPrice").textContent = `Narxi: ${product.price} so'm`;
    document.getElementById("productInfo").style.display = "block";
  } else {
    alert("Mahsulot topilmadi.");
  }
}

// Skaynerni ishga tushurish
startScanner();
