import React, { FC } from 'react';
import Typography from '@material-ui/core/Typography';


interface ICabinetTitle {
    title: string,
}

const CabinetTitle: FC<ICabinetTitle> = (props) => {
    const { title } = props;

    return <Typography variant="h4" color="primary">{title}</Typography>
};

export { CabinetTitle }