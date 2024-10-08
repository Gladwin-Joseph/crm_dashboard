import React, { useEffect, useState } from 'react';
import "./Table.css";
import * as XLSX from 'xlsx';
import {QRCodeCanvas} from 'qrcode.react';
import axios from 'axios'
import QRCodeModal from './QrCodeModal';
import { AiOutlineTable, AiOutlineAppstore } from 'react-icons/ai';
import { HashLoader } from 'react-spinners';
import {supabase} from '../supabaseClient'
import placeholderImage from './placeholder1.jpg'

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
    const [isLoading, setIsLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(20000);
    const [search,setSearch] = useState("");  
    const [filteredData, setFilteredData] = useState([]);
    const [selectedFilter,setSelectedFilter]= useState('showZero')
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQRCode,setSelectedQRCode] = useState(null);
    const [view,setView]= useState('table');
    const [isTableView, setIsTableView] = useState(true);
    const [netAmountSum,setNetAmountSum]= useState(0);
    const [totalQuotationCount, setTotalQuotationCount] = useState(0);
    const [totalVisitCount, setTotalVisitCount] = useState(0);
    const [totalStockCount, setTotalStockCount] = useState(0);
    const [error, setError] = useState(null);
    const [supabaseData, setSupabaseData] = useState([]);
    const [imageData,setImageData]= useState([]);
    const [emails,setEmails] =useState([]);
    const handleQRCodeClick= (value) => {
        setSelectedQRCode(value);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedQRCode(null);
    }

    useEffect(() => {
        const fetchSupabaseData = async () => {
            try {
                let allData = [];
                let offset = 0;
                const limit = 1000; // Number of records to fetch in each batch
    
                while (true) {
                    const { data, error } = await supabase
                        .from('emp_pics') // Ensure this is your correct table name
                        .select('*') // You can specify columns if needed
                        .range(offset, offset + limit - 1); // Fetch records in batches
    
                    if (error) throw error;
    
                    if (data.length === 0) break; // Stop if no more records are returned
    
                    allData = [...allData, ...data]; // Append the new records
                    offset += limit; // Increment offset to fetch the next batch
                }
    
                console.log('Supabase Data:', allData); // Log Supabase data for debugging
                setSupabaseData(allData); // Store Supabase data
            } catch (error) {
                console.error('Error fetching data from Supabase:', error);
            }
        };
    
        fetchSupabaseData();
    }, []);

    useEffect(() => {
        const fetchData = () => {
            fetch("https://crm-dashboard-dipf.onrender.com/api/userdata")
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

                    //Process sum of net amount
                    const netAmountSum = data.result2.reduce((acc, item) => {
                        const netAmount = parseFloat(item["NetAmount"]); 
                        return acc + (isNaN(netAmount) ? 0 : netAmount); 
                    }, 0);
                    setNetAmountSum(netAmountSum)
                    console.log(netAmountSum)

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
                    console.log(emails)
                    const totalQuotationCount = Object.values(countsObj).reduce((acc, count) => acc + count, 0);
                    const totalVisitCount = Object.values(visitCountsObj).reduce((acc, count) => acc + count, 0);
                    const totalStockCount = Object.values(stockCountsObj).reduce((acc, count) => acc + count, 0);
                    setTotalQuotationCount(totalQuotationCount);
                    setTotalVisitCount(totalVisitCount);
                    setTotalStockCount(totalStockCount);
                    setIsLoading(false);

                    console.log({ countsObj, visitCountsObj, stockCountsObj, cityMap,phoneMap });
                })
                .catch(error => console.error(error));
        };

        fetchData();
        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval,emails]);

    const handleScroll = () => {
        if (window.innerWidth <= 1650) {
            const iconContainer = document.querySelector('.view-icons-container');
            if (window.scrollY > 2) {
                iconContainer.classList.add('hidden');
            } else {
                iconContainer.classList.remove('hidden');
            }
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

    useEffect(() => {
        // Filter employees based on counts and the selected filter
        const filteredEmployees = Object.entries(emails).filter(([fullName, email]) => {
            const count = counts[fullName] || 0;
            const visitCountValue = visitCount[fullName] || 0;
            const stockCountValue = stockCount[fullName] || 0;
    
            const matchesSearch =
                search.trim() === '' ||
                fullName.toLowerCase().includes(search.toLowerCase()) ||
                (cityMapping[fullName] && cityMapping[fullName].toLowerCase().includes(search.toLowerCase()));
    
            // Precondition: Only show employees with zero counts
            if (selectedFilter === 'showZero') {
                return count === 0 && visitCountValue === 0 && stockCountValue === 0 && matchesSearch;
            }
    
            return false; // Only return zero-count employees
        });
    
        // Match filtered zero-count employees with Supabase data (using emails)
        const filteredEmployeesWithImages = filteredEmployees.map(([fullName, email]) => {
            // Find the corresponding employee data from Supabase by comparing email
            const supabaseEmployee = supabaseData.find(emp => {
                return emp['Email_Address']?.toLowerCase() === email.toLowerCase(); // Match by email
            });
    
            // If a matching employee is found in Supabase, include the image URL
            if (supabaseEmployee) {
                return {
                    fullName, // Keep the existing employee full name
                    email, // Add the email to the returned object
                    emp_pic_url: supabaseEmployee.EMP_PIC_URL // Add the image URL from Supabase
                };
            }
    
            return { fullName, email }; // If no match, return the employee with full name and email
        });
    
        setImageData(filteredEmployeesWithImages); // Update state with filtered data
        console.log(filteredEmployeesWithImages); // Debugging log
    }, [emails, search, selectedFilter, counts, visitCount, stockCount, cityMapping, supabaseData]);
    

    

    return (
        <div className='table-wrapper'>
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <HashLoader size={200} color={"#2bb5ce"} loading={isLoading} />    
                </div>
            ): (
                <>
                    {selectedFilter === 'showZero' && (
                <div className="view-icons-container">
                    <input type='text' placeholder='Search...' className='search' onChange={(e) => setSearch(e.target.value)}/>
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

            {selectedFilter !== 'showZero' && (
                <div className="view-icons-container">
                    <input 
                        type='text' 
                        placeholder='Search...' 
                        className='search' 
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}
        
            <div className='fixed-container'>
                <div className='clock-records'>
                    <div className='heading-container'>
                        <p className='heading-text'>Champion Activity Dashboard</p>
                        <p className='sub-heading-text'>Overview</p>
                        <div className="count-amount-box">
                            <p className="count-heading">Total Quote Count(Today)</p>
                            <p className="count-value">{totalQuotationCount}</p>
                        </div>
                        <div className="count-amount-box">
                            <p className="count-heading">Total Visit Count(Today)</p>
                            <p className="count-value">{totalVisitCount}</p>
                        </div>

                        <div className="count-amount-box">
                            <p className="count-heading">Total S.T Count(Today)</p>
                            <p className="count-value">{totalStockCount}</p>
                        </div>

                        <div className="count-amount-box">
                            <p className="count-heading">
                                {selectedFilter === 'showZero' && 'Champions Not Working'}
                                {selectedFilter === 'showNonZero' && 'Champions Working'}
                                {selectedFilter === 'showAll' && 'All Champions Count'}
                            </p>
                            <p className="count-value">{filteredData.length}</p>
                        </div>
                    </div>
                    <div className='filtered-buttons'>
                        <button 
                            className={selectedFilter === 'showNonZero' ? 'active' : ''}
                            onClick={() => setSelectedFilter('showNonZero')}
                        >
                            Non-Zero Counts
                        </button>
                        <button 
                            className={selectedFilter === 'showZero' ? 'active' : ''}
                            onClick={() => setSelectedFilter('showZero')}
                        >
                            Zero Counts
                        </button>
                        <button 
                            className={selectedFilter === 'showAll' ? 'active' : ''}
                            onClick={() => setSelectedFilter('showAll')}
                        >
                            All
                        </button>
                        <button onClick={exportToExcel} className='excelbutton'>Export to Excel</button>
                    </div>
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
                    {filteredData?.length > 0 ? (
                            filteredData.filter((name) => {
                                if (typeof search === 'string' && search.trim() !== '') {
                                    const employeeNameLower = name.toLowerCase();
                                    const employeeCityLower = cityMapping[name]?.toLowerCase();
                                    return employeeNameLower.includes(search.toLowerCase()) ||
                                        employeeCityLower.includes(search.toLowerCase());
                                }
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
            {filteredData.map((name, index) => {
                const employee = imageData.find(emp => emp.fullName === name); // Get employee data
                const imageUrl = employee?.emp_pic_url; // Get the image URL or undefined
                return (
                    <div key={index} className='grid-item'>
                        <img 
                            className='employee-image' 
                            src={imageUrl || placeholderImage} 
                            alt={camelize(name)} 
                            onClick={() => handleQRCodeClick(`tel:${phoneNumbers[name]}`)} // Opens QR code modal
                            style={{ cursor: 'pointer' }} // Add cursor style for better UX
                        />
                        <p>{camelize(name)}</p>
                        <p>{capitalizeCity(cityMapping[name])}</p>
                    </div>
                        );
                    })}
                    <QRCodeModal 
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        qrCodeValue={selectedQRCode}
            />
        </div>
                
            )}
                </>
            )}
            
        </div>
    );
};

export default QuoteActivity;
