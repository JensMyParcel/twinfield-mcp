  * [](/documentation/)
  * VAT Calculation



# VAT Calculation

When creating a transaction in Twinfield via web services, a potential problem can occur regarding rounding difference because of the calculation of the VAT.

## Twinfield's VAT calculation​

Based on the following transaction, an explanation is given about Twinfield's VAT calculation.

Total invoice amount including VAT is 222.04.

Line| Line value| VAT %  
---|---|---  
1| 170.00| 21  
2| 3.50| 21  
3| 10.00| 21  
4| 0.00| 21  
5| 0.00| 21  
6| 0.00| 21  
  
Per line, the VAT value is calculated based on the line value and VAT percentage. The VAT value is rounded up or down based on the regular rounding rules to two decimals. In case of a rounding difference this difference is added to the VAT value of the next line before rounding.

Line| Line value| VAT %| VAT value unrounded| Rounding diff. prev. line| VAT value + rounding diff.| VAT value rounded  
---|---|---|---|---|---|---  
1| 170.00| 21| 35.700| 0.000| 35.700| 35.70  
2| 3.50| 21| 0.735| 0.000| 0.735| 0.74  
3| 10.00| 21| 2.100| -0.005| 2.095| 2.10  
4| 0.00| 21| 0.000| -0.005| -0.005| -0.01  
5| 0.00| 21| 0.000| 0.005| 0.005| 0.01  
6| 0.00| 21| 0.000| -0.005| -0.005| -0.01  
  
The total VAT based on the lines is 38.53. Calculating the VAT value based on the total invoice amount results in a VAT value of 38.54. Result is a difference of 0.01.

Apart from the difference of 0.01 at the end, the calculated VAT values of 0.01 seems very odd.

### Twinfield's solutions​

There are several solutions to solve the VAT rounding difference problem:

  1. Let Twinfield automatically correct the rounding difference
  2. Add the VAT values to the request sent to Twinfield



#### Solution 1​

Twinfield can automatically correct rounding differences up to 0.01. The automatic correction can be activated by adding the property `autobalancevat="true"` to the `<transaction>` tag:
    
    
    <transaction autobalancevat="true">  
    

Result is that the difference is added to the VAT value of the line with the highest value.

#### Solution 2​

The VAT value can be added to the corresponding line by using the `<vatvalue>` tag. By doing this, Twinfield will not calculate the VAT value, but uses the VAT value as passed by the `<vatvalue>` tag. This solution is the preferred one, as the external party is full in control of the transaction to be created.
