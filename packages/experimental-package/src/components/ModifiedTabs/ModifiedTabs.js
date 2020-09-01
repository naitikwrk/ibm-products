//
// Copyright IBM Corp. 2020, 2020
//
// This source code is licensed under the Apache-2.0 license found in the
// LICENSE file in the root directory of this source tree.
//

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'carbon-components-react';
import { ModifiedTabLabel } from './ModifiedTabLabel';
import { ModifiedTabNew } from './ModifiedTabNew';

export const ModifiedTabs = ({
  tabs,
  newTabLabel,
  newTabContent,
  onNewTab,
  onCloseTab,
}) => {
  const handleNewTab = (e) => {
    if (onNewTab) {
      console.log('new tab');
      onNewTab();
    }
  };

  const handleClose = (id) => {
    if (onCloseTab) {
      onCloseTab(id);
    }
  };

  return (
    <Tabs className="modified-tabs">
      {tabs.map((tab) => (
        <Tab
          href="#"
          id={tab.id}
          key={tab.id}
          label={
            <ModifiedTabLabel
              label={tab.label}
              onClose={() => handleClose(tab.id)}
            />
          }>
          <div className="some-content">{tab.content}</div>
        </Tab>
      ))}
      {/* {onNewTab ? ( */}
      <Tab
        href="#"
        id="tab-new"
        label={<ModifiedTabNew label={newTabLabel} onClick={handleNewTab} />}>
        <div className="some-content">{newTabContent}</div>
      </Tab>
      {/* ) : (
        ''
      )} */}
    </Tabs>
  );
};

ModifiedTabs.propTypes = {
  /**
   * Tabs array containing tab object { id, label, content }
   */
  tabs: PropTypes.array,
  /**
   * New tab label
   */
  newTabLabel: PropTypes.string,
  /**
   * New tab content
   */
  newTabContent: PropTypes.string,
  /**
   * Optional onNewTab handler
   */
  onNewTab: PropTypes.func,
  /**
   * Optional onCloseTab handler
   */
  onCloseTab: PropTypes.func,
};

ModifiedTabs.defaultProps = {
  tabs: [
    {
      id: 'tab-1',
      label: 'Tab 1',
      content: <div>Iam am the content of tab 1.</div>,
    },
  ],
  newTabLabel: 'New tab',
  newTabContent: 'Your new tab will be here soon',
  onNewTab: undefined,
  onCloseTab: undefined,
};
