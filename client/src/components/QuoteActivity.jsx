import React, { useEffect, useState } from 'react';
import "./Table.css";
import * as XLSX from 'xlsx';
import {QRCodeCanvas} from 'qrcode.react';
import DigitalClock from './DigitalClock';
import QRCodeModal from './QrCodeModal';
import { AiOutlineTable, AiOutlineAppstore } from 'react-icons/ai';

function camelize(str) {
    return str
        .split(/(?=[A-Z])/) // Split the string at every uppercase letter
        .map(word => word.toLowerCase()) // Convert each segment to lowercase
        .join('') // Join the segments back together
        .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
}
function capitalizeCity(city) {
    if (!city) return ''; // Handle cases where city is undefined or null
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
}

const QuoteActivity = () => {
    const [data, setData] = useState([]);
    const [counts, setCounts] = useState({});
    const [cityMapping, setCityMapping] = useState({});
    const [visitCount, setVisitCount] = useState({});
    const [stockCount, setStockCount] = useState({});
    const [employees, setEmployees] = useState([]);
    const [phoneNumbers, setPhoneNumbers] = useState({});
    const [emails,setEmails]= useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(20000);
    const [search,setSearch] = useState("");  
    const [filteredData, setFilteredData] = useState([]);
    const [selectedFilter,setSelectedFilter]= useState('showZero')
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQRCode,setSelectedQRCode] = useState(null);
    const [view,setView]= useState('table');
    const [isTableView, setIsTableView] = useState(true);
    const [showIcons, setShowIcons] = useState(true);
    
    const handleQRCodeClick= (value) => {
        setSelectedQRCode(value);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedQRCode(null);
    }
    useEffect(() => {
        const fetchData = () => {
            fetch("https://crm-dashboard-y946.onrender.com/api/userdata")
                .then(response => response.json())
                .then(data => {
                    setData(data);

                    // Process quotation counts
                    const countsObj = data.result2.reduce((acc, item) => {
                        acc[item["CreatedBy"]] = (acc[item["CreatedBy"]] || 0) + 1;
                        return acc;
                    }, {});
                    setCounts(countsObj);

                    // Process visit counts
                    const visitCountsObj = data.result9.reduce((acc, item) => {
                        acc[item["CreatedBy"]] = (acc[item["CreatedBy"]] || 0) + 1;
                        return acc;
                    }, {});
                    setVisitCount(visitCountsObj);

                    // Process stock counts
                    const stockCountsObj = data.result5.reduce((acc, item) => {
                        acc[item["CreatedBy"]] = (acc[item["CreatedBy"]] || 0) + 1;
                        return acc;
                    }, {});
                    setStockCount(stockCountsObj);

                    // Process name data
                    const namesArray = data.result11.map(item => item["FormattedName"]);
                    //Process city data
                    const citiesArray = data.result11.map(item => item["City"]);
                    //Process emails data
                    const emailsArray = data.result11.map(item => item["Email"]);
                    //Process Phone Number data
                    const phoneNumbersArray = data.result11.map(item => item["Mobile"]);
                    //City Map 
                    const cityMap = namesArray.reduce((acc, name, index) => {
                        acc[name] = citiesArray[index];
                        return acc;
                    }, {});
                    //Phone Map
                    const phoneMap = namesArray.reduce((acc, name, index) => {
                        acc[name] = phoneNumbersArray[index];
                        return acc;
                    }, {});
                    //Email Map
                    const emailMap = namesArray.reduce((acc, name, index) => {
                        acc[name] = emailsArray[index];
                        return acc;
                    }, {});
                    setCityMapping(cityMap);
                    setPhoneNumbers(phoneMap)
                    //filtering employees based on emails
                    const rpTechEmployees = namesArray.filter(name => emailMap[name]?.endsWith('@rptechindia.com'))
                    .sort((a,b) => {
                        const nameA= a.toLowerCase();
                        const nameB= b.toLowerCase();
                        if(nameA < nameB) return -1;
                        if(nameA >nameB) return 1;

                        const cityA= (cityMap[a] || '').toLowerCase();
                        const cityB= (cityMap[b] || '').toLowerCase();
                        if(cityA < cityB) return -1;
                        if(cityA > cityB) return 1;

                        return 0;
                    });
                    setEmployees(rpTechEmployees);
                    setEmails(emailMap);
                    setIsLoading(false);

                    console.log({ countsObj, visitCountsObj, stockCountsObj, cityMap,phoneMap });
                })
                .catch(error => console.error(error));
        };

        fetchData();
        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    const handleScroll = () => {
        if (window.scrollY > 5) {
            setShowIcons(false);
        } else {
            setShowIcons(true);
        }
    };
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const exportToExcel = () => {
        const dataToExport = employees
            .filter((name) => {
                if (search.trim() !== '') {
                    const employeeNameLower = name.toLowerCase();
                    const employeeCityLower = cityMapping[name]?.toLowerCase() || '';
                    return employeeNameLower.includes(search.toLowerCase()) ||
                        employeeCityLower.includes(search.toLowerCase());
                }
                return true;
            })
            .map((name) => ({
                Name: camelize(name),
                City: cityMapping[name] || 'Unknown',
                'Quotation Count': counts[name] || 0,
                'Visit Count': visitCount[name] || 0,
                'Stock Transfer Count': stockCount[name] || 0,
            }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Quote Activity");

        // Exporting the file
        XLSX.writeFile(workbook, 'ChampionActivity.xlsx');
    };

    useEffect(() => {
        const filteredEmployees = employees.filter((name) => {
            const count = counts[name] || 0;
            const visitCountValue = visitCount[name] || 0;
            const stockCountValue = stockCount[name] || 0;
            const matchesSearch = search.trim() === '' || 
                    name.toLowerCase().includes(search.toLowerCase()) ||
                    (cityMapping[name] && cityMapping[name].toLowerCase().includes(search.toLowerCase()));
        
                    if (selectedFilter === 'showNonZero') {
                        return (count > 0 || visitCountValue > 0 || stockCountValue > 0) && matchesSearch;
                    }
                
                    if (selectedFilter === 'showZero') {
                        return (count === 0 && visitCountValue === 0 && stockCountValue === 0) && matchesSearch;
                    }
                
                    if (selectedFilter === 'showAll') {
                        return matchesSearch;
                    }
                
                    return false;
        });
        setFilteredData(filteredEmployees)
    },[employees, search, selectedFilter, counts, visitCount, stockCount, cityMapping])

    const toggleView= (viewType) => {
        setView(viewType);
    };

    return (
        <div className='table-wrapper'>
            {selectedFilter === 'showZero' && (
                <div className="view-icons-container">
                    <div
                        className={`icon-container ${isTableView ? 'active' : ''}`}
                        onClick={() => setIsTableView(true)}
                    >
                        <AiOutlineTable className="icon" />
                    </div>
                    <div className="separator"></div>
                    <div
                        className={`icon-container ${!isTableView ? 'active' : ''}`}
                        onClick={() => setIsTableView(false)}
                    >
                        <AiOutlineAppstore className="icon" />
                    </div>
                </div>
            )}
        
            <div className='fixed-container'>
                <div className='clock-records'>
                    <DigitalClock />
                    <p className='heading-text'>Champion Activity Dashboard</p>
                    <p className='records'>Count: {filteredData.length}</p>
                </div>
                    <div className='center'>
                        <input type='text' placeholder='Search...' className='search' onChange={(e) => setSearch(e.target.value)}/>
                        <div className='filteredcheckboxes'>
                            <label>
                                <input 
                                    type='checkbox'
                                    checked={selectedFilter === 'showNonZero'}
                                    onChange={() => setSelectedFilter('showNonZero')}
                                />
                                Non-Zero Counts
                            </label>

                            <label>
                                <input 
                                    type='checkbox'
                                    checked={selectedFilter === 'showZero'}
                                    onChange={() => setSelectedFilter('showZero')}
                                />
                                Zero Counts
                            </label>

                            <label>
                                <input 
                                    type='checkbox'
                                    checked={selectedFilter === 'showAll'}
                                    onChange={() => setSelectedFilter('showAll')}
                                />
                                All
                            </label>
                        </div>
                        <button onClick={exportToExcel} className='excelbutton'>Export to Excel</button>
                    </div>
            </div>


            {isTableView || selectedFilter !== 'showZero' ? (
                 <table className='table-container'>  
                 <thead>
                     <tr>
                         <th>Phone Number(QR Code)</th>
                         <th>Name</th>
                         <th>City</th>
                         <th>Quotation Count</th>
                         <th>Visit Count</th>
                         <th>Stock Transfer Count</th>
                     </tr>
                 </thead>
                 <tbody>
                     {isLoading ? (
                         <tr>
                             <td className='heading' colSpan={6}>Loading...</td>
                         </tr>
                     ) : 
                         filteredData?.length > 0 ? (
                         filteredData.filter((name) => {
                             if (typeof search === 'string' && search.trim() !== '') {
                                 // Safely access and convert employee.name and employee.city to lowercase
                                 const employeeNameLower = name.toLowerCase();
                                 const employeeCityLower = cityMapping[name]?.toLowerCase();
                                 // Filter employees whose name or city matches the search term
                                 return employeeNameLower.includes(search.toLowerCase()) ||
                                     employeeCityLower.includes(search.toLowerCase());
                             }
                             // If search term is empty or not a string, return all employees
                             return true;
                         }).map((name, index) => {
                             const count = counts[name] || 0;
                             const visitCountValue = visitCount[name] || 0;
                             const stockCountValue = stockCount[name] || 0;
                             const city = capitalizeCity(cityMapping[name]) || 'Unknown';
                             const phoneNumber = phoneNumbers[name] || 'N/A';
                                 return (
                                     <tr key={index}>
                                         <td>
                                         {phoneNumber !== 'N/A' ? (
                                             <QRCodeCanvas className='qr-codes' value={`tel:${phoneNumber}`} size={50} onClick={() => handleQRCodeClick(`tel:${phoneNumber}`)} /> 
                                         ) : (
                                             'N/A'
                                         )}
                                       </td>
                                         <td className='champion'>{camelize(name)}</td>
                                         <td>{city}</td>
                                         <td>{count}</td>
                                         <td>{visitCountValue}</td>
                                         <td>{stockCountValue}</td>
                                     </tr>
                                 );
                             
                         })
                     ) : (
                         <tr>
                             <td className="heading" colSpan={6}>
                                 Nothing is here.
                             </td>
                         </tr>
                     )}
                 </tbody>
                 <QRCodeModal 
                     isOpen={isModalOpen}
                     onClose={closeModal}
                     qrCodeValue={selectedQRCode}
                 />
             </table>
            ): (
                <div className='grid-container'>
                    {filteredData.map((name,index) => (
                        <div key={index} className='grid-item'>
                            <QRCodeCanvas className='qr-codes' value={`tel:${phoneNumbers[name]}`} size={100}   onClick={() => handleQRCodeClick(`tel:${phoneNumbers[name]}`)}/>
                            <p>{camelize(name)}</p>
                            <p>{capitalizeCity(cityMapping[name])}</p>
                        </div>
                    ))}
                     <QRCodeModal 
                     isOpen={isModalOpen}
                     onClose={closeModal}
                     qrCodeValue={selectedQRCode}
                    />
                </div>
                
            )}
        </div>
    );
};

export default QuoteActivity;
