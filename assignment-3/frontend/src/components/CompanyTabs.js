import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import SummaryTab from './tabs/SummaryTab';
import NewsTab from './tabs/NewsTab';
import ChartTab from './tabs/ChartTab';
import InsightTab from './tabs/InsightTab';
import './CopmanyTabs.css'

const CompanyTabs = () => {
  const [key, setKey] = useState('summary');

  return (
    <Tabs
      id="company-tabs"
      activeKey={key}
      onSelect={(k) => setKey(k)}
      style={{width: '100%'}}
      className='mx-auto'
    >
      <Tab eventKey="summary" title="Summary">
        <div className='d-flex, flex-column, justify-content-center, align-items-center' style={{width: '100%'}}>
          <SummaryTab />
        </div>
      </Tab>
      <Tab eventKey="news" title="Top News">
        <div className='d-flex, flex-column, justify-content-center, align-items-center' style={{width: '100%'}}>
          <NewsTab />
        </div>
      </Tab>
      <Tab eventKey="charts" title="Charts">
        <ChartTab />
      </Tab>
      <Tab eventKey="insights" title="Insights">
        <InsightTab />
      </Tab>
    </Tabs>
  );
};

export default CompanyTabs;
