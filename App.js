import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const App = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [panCardNo, setPanCardNo] = useState('');
  const [details, setDetails] = useState(null);
  const [token, setToken] = useState('');

  // Function to generate token
  const genToken = async () => {
    try {
      const response = await fetch('https://linkintime.co.in/Initial_Offer/IPO.aspx/generateToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const generatedToken = encVal(data.d);
      setToken(generatedToken);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Function to encrypt value
  const encVal = (vl) => {
    const key = CryptoJS.enc.Utf8.parse('8080808080808080');
    const iv = CryptoJS.enc.Utf8.parse('8080808080808080');

    const encryptedVal = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(vl), key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encryptedVal.toString();
  };

  // Function to fetch company details
  const getCompanyDetails = async () => {
    try {
      const response = await fetch('https://linkintime.co.in/Initial_Offer/IPO.aspx/GetDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const xmlData = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

      const companyNodes = xmlDoc.getElementsByTagName('Table');
      const companyList = Array.from(companyNodes).map((node) => ({
        id: node.getElementsByTagName('company_id')[0]?.textContent,
        name: node.getElementsByTagName('companyname')[0]?.textContent,
      }));

      setCompanies(companyList);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Function to fetch IPO details
  const getDetails = async () => {
    try {
      if (!token) {
        await genToken();
      }

      const response = await fetch('https://linkintime.co.in/Initial_Offer/IPO.aspx/SearchOnPan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          clientid: selectedCompany,
          PAN: panCardNo,
          IFSC: '',
          CHKVAL: '1',
          token: token,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setDetails(data.d);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    getCompanyDetails();
  }, []);

  return (
    <div className="App">
      <h1>IPO Allotment Details</h1>
      
      <label>
        Select Company:
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          <option value="">Select a company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </label>

      <input
        type="text"
        placeholder="Enter PAN Card Number"
        value={panCardNo}
        onChange={(e) => setPanCardNo(e.target.value)}
      />
      <button onClick={getDetails}>Get Details</button>

      {details && (
        <div>
          <h2>Details</h2>
          <pre>{details}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
