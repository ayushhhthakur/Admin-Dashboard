// assets
import { IconUsers, IconBriefcase, IconMicrophone } from '@tabler/icons-react';

// constant
const icons = {
  IconUsers,
  IconBriefcase,
  IconMicrophone
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/utils/users',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'jobs',
      title: 'Jobs',
      type: 'item',
      url: '/utils/jobs',
      icon: icons.IconBriefcase,
      breadcrumbs: false
    },
    {
      id: 'interview',
      title: 'Interview',
      type: 'item',
      url: '/utils/interview',
      icon: icons.IconMicrophone,
      breadcrumbs: false
    }
  ]
};

export default utilities;
