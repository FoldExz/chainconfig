import { useState, useEffect } from 'react';
import './App.scss';
// import { chainconfig_backend } from 'declarations/chainconfig_backend';

function App() {
  const [activeTab, setActiveTab] = useState('Config');
  const [selectedDevice, setSelectedDevice] = useState({
    id: 1,
    name: 'switch8230ab',
    ip: '192.168.1.5',
    mac: '7C:31:0E:82:30:AB',
    deviceType: 'Cisco',
    isOnline: true,
    isImportant: true
  });
  const [configs, setConfigs] = useState([]);
  const [events, setEvents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [snmpSensors, setSnmpSensors] = useState([]);
  const [tcpSensors, setTcpSensors] = useState([]);
  
  // Mock data - in a real app, this would come from the backend
  useEffect(() => {
    // Mock configs
    setConfigs([
      { id: 1, type: 'Automatic Backup', date: '2022 Apr 18 03:10:19 AM (CEST)', isAutomatic: true },
      { id: 2, type: 'Automatic Backup', date: '2022 Apr 18 03:10:13 AM (CEST)', isAutomatic: true },
      { id: 3, type: 'Manual Backup', date: '2022 Apr 15 04:34:15 PM (CEST)', isAutomatic: false },
      { id: 4, type: 'Automatic Backup', date: '2022 Apr 15 04:26:05 PM (CEST)', isAutomatic: true },
      { id: 5, type: 'Automatic Backup', date: '2021 Sep 10 04:07:05 PM (CEST)', isAutomatic: true }
    ]);
    
    // Mock events
    setEvents([
      { id: 1, type: 'Configuration Changed', date: '2022 Apr 18 03:10 AM (CEST)' },
      { id: 2, type: 'Configuration Misalignment', date: '2022 Apr 18 03:03 AM (CEST)' },
      { id: 3, type: 'Configuration Changed', date: '2022 Apr 18 03:03 AM (CEST)' },
      { id: 4, type: 'Configuration Changed', date: '2021 Sep 20 04:07 PM (CEST)' },
      { id: 5, type: 'Configuration Misalignment', date: '2021 Sep 20 04:04 PM (CEST)' }
    ]);
    
    // Mock SNMP sensors
    setSnmpSensors([
      { name: 'ifNumber', value: 17 },
      { name: 'nCpuUtilDuringLast5Minutes', value: 4 }
    ]);
    
    // Mock TCP sensors
    setTcpSensors([]);
    
  }, []);
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  
  const renderTabContent = () => {
    if (activeTab === 'Config') {
      return (
        <div className="config-tab-content">
          <div className="config-management">
            <h3>Configuration Management</h3>
            <p>Backup and restore the device configuration</p>
            
            <div className="auto-backup-info">
              <div className="icon-wrapper">
                <div className="sync-icon"></div>
              </div>
              <div className="backup-details">
                <div>Automatic Backup (check every 6 Hours)</div>
                <div className="last-check">Last check 2 hours ago</div>
              </div>
              <button className="backup-now-btn">Backup Now</button>
            </div>
            
            <div className="last-backup">Last Configuration Backup:</div>
            
            <div className="backup-entry">
              <div className="backup-info">
                <strong>Automatic Backup</strong>
                <div>2022 Apr 18 03:10:19 AM (CEST)</div>
              </div>
              <div className="backup-actions">
                <button className="action-btn">Restore</button>
                <button className="action-btn">View</button>
              </div>
            </div>
            
            <div className="archived-backups">
              <div className="archive-header">Archived Backups</div>
              <div className="search-container">
                <input type="text" placeholder="Search" className="search-input" />
              </div>
              
              <div className="add-config">
                <div className="add-icon">+</div>
                <div className="add-text">
                  Click to add a configuration file to the archive<br />
                  or drop your file here
                </div>
              </div>
              
              {configs.slice(1).map((config) => (
                <div key={config.id} className="backup-item">
                  <div className="delete-icon"></div>
                  <div className="download-icon"></div>
                  <div className="config-info">
                    <div className="config-type">{config.type}</div>
                    <div className="config-date">{config.date}</div>
                  </div>
                  <div className="config-actions">
                    <button className="action-btn">Restore</button>
                    <button className="action-btn">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="sidebar">
            <div className="cisco-logo-container">
              <div className="cisco-logo"></div>
              <div className="connected-services">Connected Services</div>
            </div>
            
            <div className="it-glue-container">
              <div className="it-glue-icon"></div>
              <div className="it-glue-text">See your device in IT Glue</div>
              <div className="arrow-icon"></div>
            </div>
            
            <div className="events-container">
              <div className="section-header">
                <h4>Latest Events</h4>
                <div className="see-all">See All</div>
              </div>
              
              <div className="events-list">
                {events.map((event) => (
                  <div key={event.id} className="event-item">
                    <div className={`event-icon ${event.type.includes('Misalignment') ? 'misalignment' : 'changed'}`}></div>
                    <div className="event-details">
                      <div className="event-type">{event.type}</div>
                      <div className="event-date">{event.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="connections-container">
              <div className="section-header">
                <h4>Latest Connections</h4>
                <div className="see-all">See All</div>
              </div>
              
              <div className="create-connection">
                <div>Create a Connection</div>
                <div className="plus-icon">+</div>
              </div>
            </div>
            
            <div className="snmp-container">
              <div className="section-header">
                <h4>Latest Updated SNMP Sensors</h4>
                <div className="see-all">See All</div>
              </div>
              
              <div className="snmp-table">
                {snmpSensors.map((sensor, index) => (
                  <div key={index} className="snmp-row">
                    <div className="sensor-name">{sensor.name}</div>
                    <div className="sensor-value">{sensor.value}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="tcp-container">
              <div className="section-header">
                <h4>Latest Updated TCP Sensors</h4>
                <div className="see-all">See All</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return <div className="tab-placeholder">Content for {activeTab} tab</div>;
  };
  
  return (
    <div className="app-container">
      <div className="sidebar-menu">
        <div className="menu-item active">d</div>
        <div className="menu-item devices-icon"></div>
        <div className="menu-item charts-icon"></div>
        <div className="menu-item insights-icon"></div>
        <div className="menu-item alerts-icon"></div>
        <div className="menu-item settings-icon"></div>
      </div>
      
      <div className="main-content">
        <div className="header">
          <div className="navigation">
            <span className="back-arrow">‹</span>
            <span className="nav-text">Search & Manage / Device Details</span>
          </div>
        </div>
        
        <div className="device-header">
          <div className="device-icon"></div>
          <div className="device-info">
            <div className="device-name">{selectedDevice.name}</div>
            <div className="device-details">
              <span className={`status-indicator ${selectedDevice.isOnline ? 'online' : 'offline'}`}></span>
              <span className="status-text">{selectedDevice.isOnline ? 'online' : 'offline'}</span>
              <span className="ip-address">{selectedDevice.ip}</span>
              <span className="mac-address">| {selectedDevice.mac}</span>
              <span className="device-type">| {selectedDevice.deviceType}</span>
              <span className="importance">| {selectedDevice.isImportant ? 'Important' : 'Normal'}</span>
            </div>
          </div>
          <div className="edit-icon"></div>
        </div>
        
        <div className="device-status">
          <div className="status-circle">
            <span className="status-text">All services are unlocked</span>
          </div>
          <button className="access-manager-btn">Access Manager</button>
        </div>
        
        <div className="tabs">
          <div className={`tab ${activeTab === 'Info' ? 'active' : ''}`} onClick={() => handleTabClick('Info')}>Info</div>
          <div className={`tab ${activeTab === 'Connect' ? 'active' : ''}`} onClick={() => handleTabClick('Connect')}>Connect</div>
          <div className={`tab ${activeTab === 'Alerts' ? 'active' : ''}`} onClick={() => handleTabClick('Alerts')}>Alerts</div>
          <div className={`tab ${activeTab === 'History' ? 'active' : ''}`} onClick={() => handleTabClick('History')}>History</div>
          <div className={`tab ${activeTab === 'SNMP' ? 'active' : ''}`} onClick={() => handleTabClick('SNMP')}>SNMP</div>
          <div className={`tab ${activeTab === 'TCP' ? 'active' : ''}`} onClick={() => handleTabClick('TCP')}>TCP</div>
          <div className={`tab ${activeTab === 'Interfaces' ? 'active' : ''}`} onClick={() => handleTabClick('Interfaces')}>Interfaces</div>
          <div className={`tab ${activeTab === 'Config' ? 'active' : ''}`} onClick={() => handleTabClick('Config')}>Config</div>
        </div>
        
        {renderTabContent()}
      </div>
    </div>
  );
}

export default App;


// ------------------------------


// import { useState } from 'react';
// // import { chainconfig_backend } from 'declarations/chainconfig_backend';

// function App() {
//   const [greeting, setGreeting] = useState('');

//   function handleSubmit(event) {
//     event.preventDefault();
//     const name = event.target.elements.name.value;
//     chainconfig_backend.greet(name).then((greeting) => {
//       setGreeting(greeting);
//     });
//     return false;
//   }

//   return (
//     <main>
//       <img src="/logo2.svg" alt="DFINITY logo" />
//       <br />
//       <br />
//       <form action="#" onSubmit={handleSubmit}>
//         <label htmlFor="name">Enter your name: &nbsp;</label>
//         <input id="name" alt="Name" type="text" />
//         <button type="submit">Click Me!</button>
//       </form>
//       <section id="greeting">{greeting}</section>
//     </main>
//   );
// }

// export default App;
