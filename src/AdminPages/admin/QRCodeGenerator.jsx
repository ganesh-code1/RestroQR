import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { API_BASE_URL, SELF_URL } from "../../config";
import "../../assets/css/QRCode.css";

const QRCodeGenerator = () => {
  const storedSlug = localStorage.getItem("restaurantSlug");
  const [selectedOption, setSelectedOption] = useState('menu');
  const [tableId, setTableId] = useState('');
  const [tables, setTables] = useState([]); 
  const [url, setUrl] = useState(`${SELF_URL}/${storedSlug}/menu`);
  const qrCodeRef = useRef(null);
  const [color, setColor] = useState('#000000');
  const [border, setBorder] = useState('none');
  const [borderColor, setBorderColor] = useState('#000000');
  const [text, setText] = useState('Scan the QR Code');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tables`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      } else {
        console.error("Failed to fetch tables");
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const updateUrl = (option, table) => {
    let newUrl = `${SELF_URL}/${storedSlug}/${option === 'menu' ? 'menu' : 'book-table'}`;
    if (option === 'menu' && table) {
      newUrl += `/${table}`;
    }
    setUrl(newUrl);
  };

  const handleOptionChange = (e) => {
    const option = e.target.value;
    setSelectedOption(option);
    updateUrl(option, tableId);
  };

  const handleTableIdChange = (e) => {
    const newTableId = e.target.value;
    setTableId(newTableId);
    updateUrl(selectedOption, newTableId);
  };

  const handleDownload = () => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current,  { scale: 5, useCORS: true }).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'qrcode.png';
        link.click();
      });
    }
  };

  return (
    <div className="menu-container">
      <h2>Customize & Download your QR Code</h2>
      
      <label>Generate QR Code for: </label>
      <select
        value={selectedOption}
        onChange={handleOptionChange}
        style={{ padding: '10px', width: '300px', margin: '10px 20px 0 0', borderRadius: '6px' }}
      >
        <option value="menu">Menu</option>
        <option value="book-table">Table Reservation</option>
      </select>

      {selectedOption === 'menu' && (
        <>
          <label>Table ID: </label>
          <select
            value={tableId}
            onChange={handleTableIdChange}
            style={{ padding: "10px", width: "300px", borderRadius: "6px" }}
          >
            {tables.map((table) => (
              <option key={table._id} value={table.tableId}>
                {table.tableId}
              </option>
            ))}
          </select>
        </>
      )}
      <br/><br/>
      <label>URL: </label>
      <input
        type="text"
        value={url}
        style={{ padding: '10px', width: '300px', borderRadius: '6px' }}
        readOnly
      />

      {url && (
        <div className='qr-container'>
          <div className='qr-left'>
            <div ref={qrCodeRef} className='QRFrame' style={{ border: border !== 'none' ? `5px ${border} ${borderColor}` : 'none' }}>
              <QRCodeSVG value={url} size={256} fgColor={color} />
              <p>{text}</p>
            </div>
          </div>
          <div className='qr-right'>
            <h2>Customize your QR</h2>
            
            <label>QR Code Color:</label>
            <input style={{ padding: '0px', width: '200px', marginTop: '10px' }} type="color" value={color} onChange={(e) => setColor(e.target.value)} className="color-picker" />
            <br/><br/>

            <label>Border Style:</label>
            <select style={{ padding: '5px', width: '200px', marginTop: '10px' }} value={border} onChange={(e) => setBorder(e.target.value)}>
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
            <br/><br/>
            {border !== 'none' && (
              <>
                <label>Border Color:</label>
                <input style={{ padding: '0px', width: '200px', marginTop: '10px' }} type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="color-picker" />
                <br /><br />
              </>
            )}
            <label>Custom Text Below QR:</label>
            <input
              type="text" value={text}
              onChange={(e) => setText(e.target.value)} style={{ padding: '5px', width: '200px', marginTop: '10px' }}
            />
          </div>
        </div>
      )}

      <button onClick={handleDownload} disabled={!url} className='submit-button' > Download QR Code </button>
    </div>
  );
};

export default QRCodeGenerator;
