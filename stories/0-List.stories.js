import React from 'react';
import { action } from '@storybook/addon-actions';
import List from '../src/list';
import values from 'lodash/values';

import './index.css';

export default {
    component: List,
    title: 'List',
};

let hashmap = {
    NY: 'New York',
    MN: 'Minnesota',
    SC: 'South Carolina',
    MO: 'Missouri',
    SD: 'South Dakota',
    DE: 'Delaware',
    MS: 'Mississippi',
    TN: 'Tennessee',
    FL: 'Florida',
    MT: 'Montana ',
}

let e1items = values(hashmap);

export const Simple = () => (
    <List items={e1items} selected={[3]} disabled={[0, 4, 6, 7, 9]} />
);

export const Multiple = () => (
    <List items={e1items} selected={[2, 4, 6]} multiple={true}  />
);

